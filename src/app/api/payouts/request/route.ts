import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { canRequestPayout, hasAntiCheatHold } from "@/lib/payments/payouts";
import { getSeasonConfig } from "@/lib/season";

export async function POST(request: NextRequest) {
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

  const { tournamentId, amount } = payload as {
    tournamentId?: string;
    amount?: number;
  };

  if (!tournamentId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [profile, tournament, entry, cases, season] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.tournament.findUnique({ where: { id: tournamentId } }),
    prisma.entry.findUnique({
      where: {
        userId_tournamentId: {
          userId: user.id,
          tournamentId,
        },
      },
    }),
    prisma.antiCheatCase.findMany({
      where: { userId: user.id, tournamentId },
    }),
    getSeasonConfig(),
  ]);

  if (!profile || !tournament || !entry) {
    return NextResponse.json({ error: "Not eligible" }, { status: 400 });
  }

  if (season.prizeMode !== "cash") {
    return NextResponse.json(
      { error: "Cash payouts are disabled. Gift cards are issued separately." },
      { status: 400 },
    );
  }

  if (tournament.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Tournament is not completed" },
      { status: 400 },
    );
  }

  const hold = hasAntiCheatHold(cases);
  if (!canRequestPayout(profile.kycStatus, hold)) {
    return NextResponse.json(
      { error: "Payout not allowed" },
      { status: 400 },
    );
  }

  if (Number(amount) > Number(tournament.prizePool)) {
    return NextResponse.json({ error: "Amount exceeds prize pool" }, { status: 400 });
  }

  const payout = await prisma.payout.create({
    data: {
      userId: user.id,
      tournamentId,
      amount,
      status: "PENDING",
      antiCheatHold: hold,
      kycVerifiedAt: profile.kycVerifiedAt ?? null,
    },
  });

  return NextResponse.json({ payoutId: payout.id }, { status: 201 });
}
