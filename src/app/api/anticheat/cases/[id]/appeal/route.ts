import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { appealSchema } from "@/lib/anticheat/validation";

type RouteContext = {
  params: { id: string };
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = appealSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const caseItem = await prisma.antiCheatCase.findUnique({
    where: { id: params.id },
  });
  if (!caseItem || caseItem.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (caseItem.status === "RESOLVED" || caseItem.status === "DISMISSED") {
    return NextResponse.json(
      { error: "Case is closed" },
      { status: 400 },
    );
  }

  await prisma.antiCheatCase.update({
    where: { id: caseItem.id },
    data: {
      appealText: parsed.data.appealText,
      status: "APPEALED",
    },
  });

  return NextResponse.json({ ok: true });
}
