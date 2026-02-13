import { Queue } from "bullmq";
import IORedis from "ioredis";

export type QueueStats = {
  name: string;
  paused: boolean;
  counts: {
    waiting: number;
    active: number;
    delayed: number;
    completed: number;
    failed: number;
  };
};

const REDIS_URL = process.env.REDIS_URL;
const connection = REDIS_URL
  ? new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  : null;
const queueCache = new Map<string, Queue>();

export const QUEUE_NAMES = {
  notifications: "notifications",
  audits: "audits",
  announcements: "announcements",
} as const;

export function hasQueueConnection() {
  return Boolean(connection);
}

export function getQueue(name: string) {
  if (!connection) {
    throw new Error("Redis is not configured.");
  }
  if (!queueCache.has(name)) {
    queueCache.set(
      name,
      new Queue(name, {
        connection,
        defaultJobOptions: {
          removeOnComplete: 500,
          removeOnFail: 1000,
        },
      }),
    );
  }
  return queueCache.get(name)!;
}

export async function getQueueStats(name: string): Promise<QueueStats> {
  const queue = getQueue(name);
  const [counts, paused] = await Promise.all([
    queue.getJobCounts("waiting", "active", "delayed", "completed", "failed"),
    queue.isPaused(),
  ]);
  return {
    name,
    paused,
    counts: {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      delayed: counts.delayed ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
    },
  };
}

export async function pauseQueue(name: string) {
  const queue = getQueue(name);
  await queue.pause();
}

export async function resumeQueue(name: string) {
  const queue = getQueue(name);
  await queue.resume();
}
