import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import sgMail from "@sendgrid/mail";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("REDIS_URL is required to run the announcements worker.");
  process.exit(1);
}

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const prisma = new PrismaClient();
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const QUEUE_NAME = "announcements";

async function sendEmail({ to, subject, text, html }) {
  if (!apiKey || !fromEmail) {
    return { ok: false, error: "SendGrid is not configured." };
  }
  try {
    await sgMail.send({
      to,
      from: fromEmail,
      subject,
      text,
      html: html ?? text.replace(/\n/g, "<br/>"),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

async function buildRecipients(announcement) {
  const filters = announcement.audienceFilters ?? {};
  if (announcement.audience === "SELECTED") {
    const userIds = Array.isArray(filters.userIds) ? filters.userIds : [];
    if (userIds.length === 0) {
      return [];
    }
    return prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true },
    });
  }

  if (announcement.audience === "RANDOM") {
    const count = Number(filters.randomCount ?? 1);
    if (!Number.isFinite(count) || count <= 0) {
      return [];
    }
    return prisma.$queryRaw`
      SELECT "id", "email"
      FROM "User"
      WHERE "email" IS NOT NULL
      ORDER BY RANDOM()
      LIMIT ${count}
    `;
  }

  return prisma.user.findMany({
    where: { email: { not: null } },
    select: { id: true, email: true },
  });
}

async function ensureDeliveries(announcement) {
  const existing = await prisma.announcementDelivery.count({
    where: { announcementId: announcement.id },
  });
  if (existing > 0) {
    return;
  }

  const recipients = await buildRecipients(announcement);
  const records = recipients
    .filter((user) => user.email)
    .map((user) => ({
      announcementId: announcement.id,
      userId: user.id,
      email: user.email,
    }));

  if (records.length === 0) {
    return;
  }

  await prisma.announcementDelivery.createMany({
    data: records,
    skipDuplicates: true,
  });
}

async function sendPendingDeliveries(announcement) {
  const pending = await prisma.announcementDelivery.findMany({
    where: { announcementId: announcement.id, status: "PENDING" },
    take: 200,
  });

  let sent = 0;
  let failed = 0;

  for (const delivery of pending) {
    const result = await sendEmail({
      to: delivery.email,
      subject: announcement.subject,
      text: announcement.body,
    });

    if (result.ok) {
      sent += 1;
      await prisma.announcementDelivery.update({
        where: { id: delivery.id },
        data: { status: "SENT", sentAt: new Date(), error: null },
      });
    } else {
      failed += 1;
      await prisma.announcementDelivery.update({
        where: { id: delivery.id },
        data: { status: "FAILED", error: result.error ?? "Unknown error" },
      });
    }
  }

  return { sent, failed, processed: pending.length };
}

async function finalizeAnnouncement(announcement) {
  const [sentCount, failedCount, pendingCount] = await Promise.all([
    prisma.announcementDelivery.count({
      where: { announcementId: announcement.id, status: "SENT" },
    }),
    prisma.announcementDelivery.count({
      where: { announcementId: announcement.id, status: "FAILED" },
    }),
    prisma.announcementDelivery.count({
      where: { announcementId: announcement.id, status: "PENDING" },
    }),
  ]);

  const status =
    pendingCount > 0
      ? "SENDING"
      : failedCount > 0
        ? "FAILED"
        : "SENT";

  await prisma.adminAnnouncement.update({
    where: { id: announcement.id },
    data: {
      status,
      sentAt: pendingCount === 0 ? new Date() : announcement.sentAt,
      sentCount,
      failedCount,
    },
  });
}

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    if (job.name !== "announcement") {
      return;
    }
    const { announcementId } = job.data;
    const announcement = await prisma.adminAnnouncement.findUnique({
      where: { id: announcementId },
    });
    if (!announcement) {
      return;
    }

    await prisma.adminAnnouncement.update({
      where: { id: announcement.id },
      data: { status: "SENDING" },
    });

    await ensureDeliveries(announcement);

    let hasMore = true;
    while (hasMore) {
      const { processed } = await sendPendingDeliveries(announcement);
      hasMore = processed > 0;
    }

    await finalizeAnnouncement(announcement);
  },
  { connection },
);

async function logQueueFailure(job, err) {
  try {
    await prisma.auditLog.create({
      data: {
        action: "QUEUE_FAILURE",
        entityType: "Queue",
        entityId: job?.id?.toString() ?? null,
        afterState: {
          queue: QUEUE_NAME,
          jobName: job?.name ?? null,
          attemptsMade: job?.attemptsMade ?? null,
          error: err?.message ?? String(err),
        },
      },
    });
  } catch (error) {
    console.error("Failed to record queue failure", error);
  }
}

worker.on("failed", (job, err) => {
  console.error("Announcement job failed", job?.id, err);
  logQueueFailure(job, err);
});

worker.on("error", (err) => {
  console.error("Announcement worker error", err);
  logQueueFailure(null, err);
});

console.log("Announcements worker running...");
