import { createClient } from "redis";

type Listener = () => void;

const listeners = new Set<Listener>();
const CHANNEL = "tks:play";

let initPromise: Promise<void> | null = null;
let publisher: ReturnType<typeof createClient> | null = null;
let subscriber: ReturnType<typeof createClient> | null = null;

function getRedisUrl() {
  return process.env.REDIS_URL ?? "";
}

async function initRedis() {
  if (initPromise) {
    return initPromise;
  }

  const url = getRedisUrl();
  if (!url) {
    return;
  }

  initPromise = (async () => {
    try {
      publisher = createClient({ url });
      subscriber = createClient({ url });

      publisher.on("error", () => {});
      subscriber.on("error", () => {});

      await Promise.all([publisher.connect(), subscriber.connect()]);

      await subscriber.subscribe(CHANNEL, () => {
        listeners.forEach((listener) => listener());
      });
    } catch {
      publisher = null;
      subscriber = null;
    }
  })();

  return initPromise;
}

export function subscribePlayStream(listener: Listener) {
  listeners.add(listener);
  void initRedis();
  return () => listeners.delete(listener);
}

export function publishPlayStream() {
  listeners.forEach((listener) => listener());
  void initRedis();
  if (publisher?.isOpen) {
    publisher.publish(CHANNEL, Date.now().toString()).catch(() => {});
  }
}
