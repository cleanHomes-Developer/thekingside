import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getQueueStats, hasQueueConnection, QUEUE_NAMES } from "@/lib/queues";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasQueueConnection()) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 400 });
  }

  const stats = await Promise.all(
    Object.values(QUEUE_NAMES).map((name) => getQueueStats(name)),
  );

  return NextResponse.json({ stats });
}
