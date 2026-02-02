import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";

type RouteContext = {
  params: { id: string };
};

const CHECKIN_WINDOW_MINUTES = 20;

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
  });
  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const entry = await prisma.entry.findUnique({
    where: {
      userId_tournamentId: {
        userId: user.id,
        tournamentId: params.id,
      },
    },
  });
  if (!entry || entry.status === "CANCELLED") {
    return NextResponse.json({ error: "Not registered" }, { status: 400 });
  }

  if (entry.status === "PENDING") {
    return NextResponse.json(
      { error: "Entry pending payment" },
      { status: 400 },
    );
  }

  const now = new Date();
  const checkInOpensAt = new Date(tournament.startDate);
  checkInOpensAt.setMinutes(checkInOpensAt.getMinutes() - CHECKIN_WINDOW_MINUTES);
  const checkInClosesAt = tournament.lockAt;

  if (now < checkInOpensAt) {
    return NextResponse.json(
      { error: "Check-in not open yet" },
      { status: 400 },
    );
  }
  if (now > checkInClosesAt) {
    return NextResponse.json({ error: "Check-in closed" }, { status: 400 });
  }

  const updated = await prisma.entry.update({
    where: { id: entry.id },
    data: { checkedInAt: entry.checkedInAt ?? new Date() },
  });

  return NextResponse.json({
    ok: true,
    checkedInAt: updated.checkedInAt?.toISOString() ?? null,
  });
}
