import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { pauseQueue, QUEUE_NAMES } from "@/lib/queues";

type Context = { params: { name: string } };

export async function POST(_: Request, { params }: Context) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Object.values(QUEUE_NAMES).includes(params.name as any)) {
    return NextResponse.json({ error: "Unknown queue" }, { status: 404 });
  }

  await pauseQueue(params.name);
  return NextResponse.json({ ok: true });
}
