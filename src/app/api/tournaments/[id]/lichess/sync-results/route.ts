import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { fetchLichessGame } from "@/lib/lichess/client";
import { mapLichessResult } from "@/lib/lichess/results";
import { maybeAdvanceSwissRound } from "@/lib/tournaments/advance";

type RouteContext = {
  params: { id: string };
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    where: {
      tournamentId: params.id,
      lichessGameId: { not: null },
    },
  });

  const updated = [];
  for (const match of matches) {
    if (!match.lichessGameId) {
      continue;
    }

    if (match.lichessGameId.startsWith("dev-")) {
      const result = mapLichessResult({ status: "draw" });
      const updatedMatch = await prisma.match.update({
        where: { id: match.id },
        data: {
          result,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      updated.push(updatedMatch);
      continue;
    }

    const player1Profile = await prisma.profile.findUnique({
      where: { userId: match.player1Id },
    });
    const accessToken = player1Profile?.lichessAccessToken;
    if (!accessToken) {
      continue;
    }

    const game = await fetchLichessGame(match.lichessGameId, accessToken);
    const result = mapLichessResult(game);
    if (!result) {
      continue;
    }

    const updatedMatch = await prisma.match.update({
      where: { id: match.id },
      data: {
        result,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
    updated.push(updatedMatch);
  }

  await maybeAdvanceSwissRound(params.id);

  return NextResponse.json({ updated: updated.length });
}
