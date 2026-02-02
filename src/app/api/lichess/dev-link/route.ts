import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getLichessConfig } from "@/lib/lichess/client";

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (getLichessConfig()) {
    return NextResponse.json(
      { error: "Dev link is disabled when OAuth is configured" },
      { status: 400 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile?.lichessUsername) {
    return NextResponse.json(
      { error: "Set a Lichess username before linking" },
      { status: 400 },
    );
  }

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      lichessAccessToken: "dev-token",
      lichessTokenCreatedAt: new Date(),
      lichessLinkedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
