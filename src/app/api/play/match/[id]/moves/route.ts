import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";

const GUEST_COOKIE = "tks_guest";

type Params = {
  params: { id: string };
};

async function getPlayerId() {
  const session = await getSessionFromCookies();
  if (session?.sub) {
    const player = await prisma.casualPlayer.findUnique({
      where: { userId: session.sub },
    });
    return player?.id ?? null;
  }

  const guestKey = cookies().get(GUEST_COOKIE)?.value;
  if (!guestKey) {
    return null;
  }
  const player = await prisma.casualPlayer.findUnique({ where: { guestKey } });
  return player?.id ?? null;
}

export async function GET(_request: Request, { params }: Params) {
  const playerId = await getPlayerId();
  if (!playerId) {
    return NextResponse.json({ error: "Player not found" }, { status: 401 });
  }

  const match = await prisma.casualMatch.findUnique({
    where: { id: params.id },
    include: {
      moves: { orderBy: { ply: "asc" } },
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const isParticipant =
    match.playerWhiteId === playerId || match.playerBlackId === playerId;
  if (!isParticipant) {
    return NextResponse.json({ error: "Not your match" }, { status: 403 });
  }

  return NextResponse.json({
    moves: match.moves.map((move) => ({
      ply: move.ply,
      san: move.san,
      createdAt: move.createdAt.toISOString(),
    })),
  });
}
