import { Prisma, type PrismaClient } from "@prisma/client";
import { buildStandings } from "@/lib/tournaments/standings";

type EntitlementResult = {
  placement: number;
  percent: Prisma.Decimal;
  amount: Prisma.Decimal;
};

type EntitlementClient = PrismaClient | Prisma.TransactionClient;

function rankKey(standing: {
  points: number;
  buchholz: number;
  sonneborn: number;
  wins: number;
  losses: number;
}) {
  return `${standing.points}|${standing.buchholz}|${standing.sonneborn}|${standing.wins}|${standing.losses}`;
}

export async function ensureDefaultPayoutSchedule(
  tx: EntitlementClient,
  tournamentId: string,
) {
  const existing = await tx.payoutSchedule.findFirst({
    where: { tournamentId },
  });
  if (existing) {
    return;
  }
  await tx.payoutSchedule.create({
    data: {
      tournamentId,
      position: 1,
      percent: new Prisma.Decimal(100),
    },
  });
}

export async function getPayoutEntitlement(
  tx: EntitlementClient,
  tournamentId: string,
  userId: string,
): Promise<EntitlementResult | null> {
  await ensureDefaultPayoutSchedule(tx, tournamentId);

  const [tournament, entries, matches, schedule] = await Promise.all([
    tx.tournament.findUnique({ where: { id: tournamentId } }),
    tx.entry.findMany({
      where: { tournamentId, status: "CONFIRMED" },
      select: { userId: true },
    }),
    tx.match.findMany({
      where: { tournamentId, result: { not: null } },
      select: { player1Id: true, player2Id: true, result: true },
    }),
    tx.payoutSchedule.findMany({
      where: { tournamentId },
      orderBy: { position: "asc" },
    }),
  ]);

  if (!tournament) {
    return null;
  }

  if (!entries.length) {
    return null;
  }

  const standings = buildStandings(entries, matches);
  const placementMap = new Map<string, number>();
  let lastKey = "";
  let currentPlacement = 1;

  standings.forEach((standing, index) => {
    const key = rankKey(standing);
    if (index === 0) {
      currentPlacement = 1;
      lastKey = key;
    } else if (key !== lastKey) {
      currentPlacement = index + 1;
      lastKey = key;
    }
    placementMap.set(standing.userId, currentPlacement);
  });

  const placement = placementMap.get(userId);
  if (!placement) {
    return null;
  }

  const payoutSlot = schedule.find((slot) => slot.position === placement);
  if (!payoutSlot) {
    return null;
  }

  const percent = new Prisma.Decimal(payoutSlot.percent.toString());
  const amount = new Prisma.Decimal(tournament.prizePool.toString())
    .mul(percent)
    .div(100)
    .toDecimalPlaces(2);
  if (amount.lte(0)) {
    return null;
  }

  return { placement, percent, amount };
}
