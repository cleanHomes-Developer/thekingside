import { NextResponse } from "next/server";
import { createClient } from "redis";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

async function withTimeout<T>(promise: Promise<T>, ms: number) {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  const result = await Promise.race([promise, timeout]);
  if (timer) {
    clearTimeout(timer);
  }
  return result as T | null;
}

async function checkRedis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    return { status: "not_configured", latencyMs: null };
  }
  const client = createClient({ url });
  try {
    await client.connect();
    const start = Date.now();
    const result = await withTimeout(client.ping(), 2000);
    const latencyMs = result ? Date.now() - start : null;
    return {
      status: result ? "ok" : "timeout",
      latencyMs,
    };
  } catch (error) {
    return { status: "error", latencyMs: null, message: String(error) };
  } finally {
    try {
      await client.quit();
    } catch {
      // Ignore close errors.
    }
  }
}

async function checkStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return { status: "not_configured" };
  }
  const stripe = new Stripe(key, { apiVersion: "2023-10-16" });
  try {
    const result = await withTimeout(stripe.accounts.retrieve(), 2000);
    return { status: result ? "ok" : "timeout" };
  } catch (error) {
    return { status: "error", message: String(error) };
  }
}

function checkSentry() {
  return process.env.SENTRY_DSN
    ? { status: "configured" }
    : { status: "not_configured" };
}

async function checkDatabase() {
  try {
    const result = await withTimeout(prisma.$queryRaw`SELECT 1`, 2000);
    return { status: result ? "ok" : "timeout" };
  } catch (error) {
    return { status: "error", message: String(error) };
  }
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [redis, stripe, database] = await Promise.all([
    checkRedis(),
    checkStripe(),
    checkDatabase(),
  ]);
  const sentry = checkSentry();

  return NextResponse.json({
    redis,
    stripe,
    database,
    sentry,
    checkedAt: new Date().toISOString(),
  });
}
