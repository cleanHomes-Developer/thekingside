import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import {
  computeLockAt,
  normalizeTournamentInput,
  tournamentCreateSchema,
  tournamentStatusSchema,
} from "@/lib/tournaments/validation";
import { enforceTournamentLocks } from "@/lib/tournaments/lock";
import { serializeTournament } from "@/lib/tournaments/serialize";
import { getSeasonConfig } from "@/lib/season";
import { createLedgerEntries } from "@/lib/payments/ledger";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  await enforceTournamentLocks();
  const statusParam = request.nextUrl.searchParams.get("status");
  const status = statusParam
    ? tournamentStatusSchema.safeParse(statusParam)
    : null;
  if (statusParam && !status?.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const tournaments = await prisma.tournament.findMany({
    where: status?.success ? { status: status.data } : undefined,
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({
    tournaments: tournaments.map(serializeTournament),
  });
}

export async function POST(request: NextRequest) {
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

  const normalized = normalizeTournamentInput(
    payload as Record<string, unknown>,
  );
  const parsed = tournamentCreateSchema.safeParse(normalized);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const startDate = new Date(parsed.data.startDate);
  const lockAt = computeLockAt(startDate);
  const endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
  const season = await getSeasonConfig();
  const entryFee = season.mode === "free" ? 0 : parsed.data.entryFee;
  const seedPrizePool = season.mode === "free" ? season.freePrizePool : 0;
  const requestMeta = getRequestMeta(request);

  const tournament = await prisma.$transaction(async (tx) => {
    const created = await tx.tournament.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        entryFee,
        minPlayers: parsed.data.minPlayers,
        maxPlayers: parsed.data.maxPlayers,
        prizePool: new Prisma.Decimal(seedPrizePool),
        startDate,
        endDate: endDate ?? undefined,
        lockAt,
        timeControl: parsed.data.timeControl ?? undefined,
        seriesKey: parsed.data.seriesKey ?? undefined,
        slotKey: parsed.data.slotKey ?? undefined,
        description: parsed.data.description ?? undefined,
        createdBy: admin.id,
      },
    });

    await tx.payoutSchedule.create({
      data: {
        tournamentId: created.id,
        position: 1,
        percent: new Prisma.Decimal(100),
      },
    });

    if (season.mode === "free" && seedPrizePool > 0) {
      await createLedgerEntries(tx, created.id, [
        {
          type: "SEED",
          amount: new Prisma.Decimal(seedPrizePool),
          description: `Free season prize seed`,
          relatedUserId: admin.id,
          affectsBalance: true,
        },
      ]);

      await logAuditEvent(tx, {
        action: "PRIZE_POOL_SEED",
        userId: admin.id,
        entityType: "Tournament",
        entityId: created.id,
        beforeState: { prizePool: "0" },
        afterState: { prizePool: seedPrizePool.toString() },
        ipAddress: requestMeta.ipAddress,
        userAgent: requestMeta.userAgent,
      });
    }

    await logAuditEvent(tx, {
      action: "TOURNAMENT_CREATE",
      userId: admin.id,
      entityType: "Tournament",
      entityId: created.id,
      afterState: {
        name: created.name,
        type: created.type,
        status: created.status,
        entryFee: created.entryFee?.toString?.() ?? created.entryFee,
        minPlayers: created.minPlayers,
        maxPlayers: created.maxPlayers,
        startDate: created.startDate.toISOString(),
        lockAt: created.lockAt.toISOString(),
        timeControl: created.timeControl,
        seriesKey: created.seriesKey,
        slotKey: created.slotKey,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return created;
  });

  return NextResponse.json(
    { tournament: serializeTournament(tournament) },
    { status: 201 },
  );
}
