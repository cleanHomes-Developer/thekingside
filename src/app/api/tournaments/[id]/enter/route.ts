import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { enforceTournamentLock } from "@/lib/tournaments/lock";
import { serializeTournament } from "@/lib/tournaments/serialize";
import { getStripeClient, isStripeConfigured } from "@/lib/payments/stripe";
import {
  calculateEntryAllocation,
  createLedgerEntries,
} from "@/lib/payments/ledger";
import { Prisma } from "@prisma/client";
import { getSeasonConfig } from "@/lib/season";

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

  const lockedTournament = await enforceTournamentLock(params.id);
  if (!lockedTournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const season = await getSeasonConfig();
  const isFreeSeason = season.mode === "free";
  const now = new Date();
  if (lockedTournament.status !== "REGISTRATION") {
    return NextResponse.json(
      { error: "Tournament is not open for registration" },
      { status: 400 },
    );
  }
  if (lockedTournament.lockAt <= now) {
    return NextResponse.json(
      { error: "Registration is locked" },
      { status: 400 },
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingEntry = await tx.entry.findUnique({
      where: {
        userId_tournamentId: {
          userId: user.id,
          tournamentId: params.id,
        },
      },
    });
    if (existingEntry) {
      if (existingEntry.status === "CANCELLED") {
        return { error: "Entry is cancelled" } as const;
      }
      if (existingEntry.status === "PENDING") {
        return { error: "Entry pending payment" } as const;
      }
      if (existingEntry.status === "WAITLIST") {
        return { error: "Already on waitlist" } as const;
      }
      return { error: "Already entered" } as const;
    }

    const tournament = await tx.tournament.findUnique({
      where: { id: params.id },
    });
    if (!tournament) {
      return { error: "Not found" } as const;
    }
    const isSeatAvailable = tournament.currentPlayers < tournament.maxPlayers;
    if (!isSeatAvailable && !isFreeSeason && isStripeConfigured()) {
      return { error: "Tournament is full" } as const;
    }
    if (tournament.lockAt <= now || tournament.status !== "REGISTRATION") {
      return { error: "Registration is locked" } as const;
    }

    if (!isFreeSeason && Number(tournament.entryFee) <= 0) {
      return { error: "Tournament entry fee is invalid" } as const;
    }

    const entryStatus = isFreeSeason ? "CONFIRMED" : "PENDING";
    const entry = await tx.entry.create({
      data: {
        userId: user.id,
        tournamentId: tournament.id,
        status: isSeatAvailable ? entryStatus : "WAITLIST",
        ...(isFreeSeason && isSeatAvailable
          ? {
              paidAt: new Date(),
              paymentIntentId: `free-${tournament.id}-${user.id}`,
            }
          : {}),
      },
    });

    const updatedTournament = isSeatAvailable
      ? await tx.tournament.update({
          where: { id: tournament.id },
          data: { currentPlayers: { increment: 1 } },
        })
      : tournament;

    return {
      entry,
      tournament: updatedTournament,
      waitlisted: !isSeatAvailable,
    } as const;
  });

  if ("error" in result) {
    const status =
      result.error === "Already entered" ||
      result.error === "Entry pending payment"
        ? 409
        : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  if (result.waitlisted) {
    const waitlistCount = await prisma.entry.count({
      where: { tournamentId: result.tournament.id, status: "WAITLIST" },
    });
    return NextResponse.json({
      entry: {
        id: result.entry.id,
        status: result.entry.status,
        createdAt: result.entry.createdAt.toISOString(),
      },
      tournament: serializeTournament(result.tournament),
      waitlistPosition: waitlistCount,
    });
  }

  if (isFreeSeason) {
    return NextResponse.json({
      entry: {
        id: result.entry.id,
        status: result.entry.status,
        createdAt: result.entry.createdAt.toISOString(),
      },
      tournament: serializeTournament(result.tournament),
      mode: "free",
    });
  }

  if (!isStripeConfigured()) {
    const updatedEntry = await prisma.$transaction(async (tx) => {
      const allocation = calculateEntryAllocation(
        new Prisma.Decimal(result.tournament.entryFee),
      );

      const entry = await tx.entry.update({
        where: { id: result.entry.id },
        data: {
          status: "CONFIRMED",
          paidAt: new Date(),
          paymentIntentId: `dev-${result.entry.id}`,
        },
      });

      await tx.tournament.update({
        where: { id: result.tournament.id },
        data: { prizePool: { increment: allocation.prizeShare } },
      });

      await createLedgerEntries(tx, result.tournament.id, [
        {
          type: "ENTRY_FEE",
          amount: allocation.entryFee,
          description: `Entry fee received for ${entry.id}`,
          relatedUserId: entry.userId,
        },
        {
          type: "PLATFORM_FEE",
          amount: allocation.platformShare.mul(-1),
          description: `Platform fee for ${entry.id}`,
          relatedUserId: entry.userId,
        },
        {
          type: "STRIPE_FEE",
          amount: new Prisma.Decimal(0),
          description: `Stripe fee for ${entry.id}`,
          relatedUserId: entry.userId,
        },
      ]);

      return entry;
    });
    return NextResponse.json({
      entry: {
        id: updatedEntry.id,
        status: updatedEntry.status,
        createdAt: updatedEntry.createdAt.toISOString(),
      },
      tournament: serializeTournament(result.tournament),
      checkoutUrl: `/tournaments/${result.tournament.id}`,
      mode: "dev",
    });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tournaments/${result.tournament.id}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tournaments/${result.tournament.id}?payment=cancelled`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(result.tournament.entryFee) * 100),
          product_data: {
            name: result.tournament.name,
          },
        },
      },
    ],
    metadata: {
      entryId: result.entry.id,
      tournamentId: result.tournament.id,
      userId: user.id,
    },
  });

  return NextResponse.json({
    entry: {
      id: result.entry.id,
      status: result.entry.status,
      createdAt: result.entry.createdAt.toISOString(),
    },
    tournament: serializeTournament(result.tournament),
    checkoutUrl: session.url,
  });
}
