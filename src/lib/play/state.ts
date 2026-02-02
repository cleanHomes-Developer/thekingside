import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { buildMatchSnapshot } from "@/lib/play/match";

const GUEST_COOKIE = "tks_guest";

export async function getPlayState() {
  const session = await getSessionFromCookies();
  const guestKey = cookies().get(GUEST_COOKIE)?.value ?? null;

  const player = session?.sub
    ? await prisma.casualPlayer.findUnique({ where: { userId: session.sub } })
    : guestKey
      ? await prisma.casualPlayer.findUnique({ where: { guestKey } })
      : null;

  if (!player) {
    return { player: null, queue: null, match: null };
  }

  const queue = await prisma.casualQueueEntry.findFirst({
    where: { playerId: player.id, status: "QUEUED" },
    orderBy: { queuedAt: "desc" },
  });

  const activeMatch = await prisma.casualMatch.findFirst({
    where: {
      status: "IN_PROGRESS",
      OR: [{ playerWhiteId: player.id }, { playerBlackId: player.id }],
    },
    orderBy: { startedAt: "desc" },
  });

  const match = activeMatch ? await buildMatchSnapshot(activeMatch.id) : null;

  return {
    player: {
      id: player.id,
      displayName: player.displayName,
      rating: player.rating,
    },
    queue: queue
      ? {
          id: queue.id,
          status: queue.status,
          queuedAt: queue.queuedAt.toISOString(),
          timeControl: queue.timeControl,
        }
      : null,
    match,
  };
}
