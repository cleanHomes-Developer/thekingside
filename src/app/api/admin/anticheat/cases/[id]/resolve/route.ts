import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { resolveSchema } from "@/lib/anticheat/validation";

type RouteContext = {
  params: { id: string };
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = resolveSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const caseItem = await prisma.antiCheatCase.findUnique({
    where: { id: params.id },
  });
  if (!caseItem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.antiCheatCase.update({
    where: { id: caseItem.id },
    data: {
      status: parsed.data.status,
      adminNotes: parsed.data.adminNotes ?? null,
      resolvedBy: admin.id,
      resolvedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
