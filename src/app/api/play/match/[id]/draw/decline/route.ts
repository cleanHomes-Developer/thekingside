import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { buildMatchSnapshot } from "@/lib/play/match";
import { publishPlayStream } from "@/lib/play/stream";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { rateLimit } from "@/lib/rate-limit";

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

export async function POST(request: NextRequest, { params }: Params) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const limit = rateLimit(request, {
    keyPrefix: "play:draw",
    windowMs: 60_000,
    max: 30,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": limit.retryAfter.toString() } },
    );
  }
  const playerId = await getPlayerId();
  if (!playerId) {
    return NextResponse.json({ error: "Player not found" }, { status: 401 });
  }

  const match = await prisma.casualMatch.findUnique({
    where: { id: params.id },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  if (match.status !== "IN_PROGRESS") {
    return NextResponse.json(
      { error: "Match already completed" },
      { status: 400 },
    );
  }

  const isParticipant =
    match.playerWhiteId === playerId || match.playerBlackId === playerId;
  if (!isParticipant) {
    return NextResponse.json({ error: "Not your match" }, { status: 403 });
  }

  if (!match.drawOfferedById) {
    return NextResponse.json({ error: "No draw offer" }, { status: 400 });
  }

  await prisma.casualMatch.update({
    where: { id: match.id },
    data: {
      drawOfferedById: null,
      drawOfferedAt: null,
    },
  });

  publishPlayStream();
  const snapshot = await buildMatchSnapshot(match.id);
  return NextResponse.json({ match: snapshot });
}
