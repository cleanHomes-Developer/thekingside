import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import {
  computeLockAt,
  normalizeTournamentInput,
  tournamentUpdateSchema,
} from "@/lib/tournaments/validation";
import { enforceTournamentLock } from "@/lib/tournaments/lock";
import { serializeTournament } from "@/lib/tournaments/serialize";
import { getSeasonConfig } from "@/lib/season";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

type RouteContext = {
  params: { id: string };
};

export async function GET(_: NextRequest, { params }: RouteContext) {
  await enforceTournamentLock(params.id);

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ tournament: serializeTournament(tournament) });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.tournament.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
  const parsed = tournamentUpdateSchema.safeParse(normalized);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const requestMeta = getRequestMeta(request);

  const minPlayers = parsed.data.minPlayers ?? existing.minPlayers;
  const maxPlayers = parsed.data.maxPlayers ?? existing.maxPlayers;
  if (maxPlayers < minPlayers) {
    return NextResponse.json(
      { error: "maxPlayers must be greater than or equal to minPlayers" },
      { status: 400 },
    );
  }

  const startDate = parsed.data.startDate
    ? new Date(parsed.data.startDate)
    : existing.startDate;
  const lockAt = parsed.data.startDate
    ? computeLockAt(startDate)
    : existing.lockAt;
  const endDate =
    parsed.data.endDate === undefined
      ? existing.endDate
      : parsed.data.endDate
        ? new Date(parsed.data.endDate)
        : null;

  const season = await getSeasonConfig();
  const entryFee =
    season.mode === "free"
      ? 0
      : parsed.data.entryFee ?? existing.entryFee;

  const updateData = {
    name: parsed.data.name ?? existing.name,
    type: parsed.data.type ?? existing.type,
    entryFee,
    minPlayers,
    maxPlayers,
    startDate,
    lockAt,
    timeControl:
      parsed.data.timeControl !== undefined
        ? parsed.data.timeControl ?? undefined
        : existing.timeControl,
    seriesKey:
      parsed.data.seriesKey !== undefined
        ? parsed.data.seriesKey ?? undefined
        : existing.seriesKey,
    slotKey:
      parsed.data.slotKey !== undefined
        ? parsed.data.slotKey ?? undefined
        : existing.slotKey,
    description:
      parsed.data.description !== undefined
        ? parsed.data.description ?? undefined
        : existing.description,
  } as const;

  const tournament = await prisma.tournament.update({
    where: { id: params.id },
    data: {
      ...updateData,
      ...(parsed.data.endDate !== undefined ? { endDate } : {}),
    },
  });

    await logAuditEvent(prisma, {
      action: "TOURNAMENT_UPDATE",
      userId: admin.id,
      entityType: "Tournament",
      entityId: tournament.id,
      beforeState: {
        name: existing.name,
        type: existing.type,
        status: existing.status,
        entryFee: existing.entryFee?.toString?.() ?? existing.entryFee,
        minPlayers: existing.minPlayers,
        maxPlayers: existing.maxPlayers,
        startDate: existing.startDate.toISOString(),
        endDate: existing.endDate ? existing.endDate.toISOString() : null,
        lockAt: existing.lockAt.toISOString(),
        timeControl: existing.timeControl,
        seriesKey: existing.seriesKey,
        slotKey: existing.slotKey,
        description: existing.description,
      },
      afterState: {
        name: tournament.name,
        type: tournament.type,
        status: tournament.status,
        entryFee: tournament.entryFee?.toString?.() ?? tournament.entryFee,
        minPlayers: tournament.minPlayers,
        maxPlayers: tournament.maxPlayers,
        startDate: tournament.startDate.toISOString(),
        endDate: tournament.endDate ? tournament.endDate.toISOString() : null,
        lockAt: tournament.lockAt.toISOString(),
        timeControl: tournament.timeControl,
        seriesKey: tournament.seriesKey,
        slotKey: tournament.slotKey,
        description: tournament.description,
      },
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
  });

  return NextResponse.json({ tournament: serializeTournament(tournament) });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.tournament.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const requestMeta = getRequestMeta(request);
  await prisma.$transaction(async (tx) => {
    await tx.tournament.delete({ where: { id: params.id } });
    await logAuditEvent(tx, {
      action: "TOURNAMENT_DELETE",
      userId: admin.id,
      entityType: "Tournament",
      entityId: existing.id,
      beforeState: {
        name: existing.name,
        type: existing.type,
        status: existing.status,
        startDate: existing.startDate.toISOString(),
      },
      afterState: null,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
  });

  return NextResponse.json({ ok: true });
}
