import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({
    linked: Boolean(profile?.lichessAccessToken),
    username: profile?.lichessUsername ?? null,
    linkedAt: profile?.lichessLinkedAt?.toISOString() ?? null,
  });
}
