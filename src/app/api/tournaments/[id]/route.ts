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

  await prisma.tournament.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
