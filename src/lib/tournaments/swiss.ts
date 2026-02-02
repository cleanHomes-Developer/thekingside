import { buildStandings, type MatchLike } from "@/lib/tournaments/standings";

export type SwissPairing = {
  round: number;
  player1Id: string;
  player2Id: string | null;
  status: "SCHEDULED" | "COMPLETED";
  result: "PLAYER1" | "PLAYER2" | "DRAW" | null;
};

export function getSwissRounds(playerCount: number) {
  if (playerCount <= 1) {
    return 0;
  }
  return Math.ceil(Math.log2(playerCount)) + 1;
}

function buildOpponentMap(matches: MatchLike[]) {
  const opponents = new Map<string, Set<string>>();
  for (const match of matches) {
    if (!match.player2Id) {
      continue;
    }
    if (!opponents.has(match.player1Id)) {
      opponents.set(match.player1Id, new Set());
    }
    if (!opponents.has(match.player2Id)) {
      opponents.set(match.player2Id, new Set());
    }
    opponents.get(match.player1Id)?.add(match.player2Id);
    opponents.get(match.player2Id)?.add(match.player1Id);
  }
  return opponents;
}

function findByeCandidate(standings: ReturnType<typeof buildStandings>) {
  for (let i = standings.length - 1; i >= 0; i -= 1) {
    if (!standings[i].hadBye) {
      return standings[i].userId;
    }
  }
  return standings[standings.length - 1]?.userId ?? null;
}

export function generateSwissRound(
  entries: { userId: string }[],
  matches: MatchLike[],
  round: number,
) {
  const standings = buildStandings(entries, matches);
  const opponentMap = buildOpponentMap(matches);
  const remaining =
    matches.length === 0
      ? entries.map((entry) => entry.userId)
      : standings.map((standing) => standing.userId);
  const pairings: SwissPairing[] = [];

  if (remaining.length % 2 === 1) {
    const byePlayer = findByeCandidate(standings);
    if (byePlayer) {
      const index = remaining.indexOf(byePlayer);
      if (index >= 0) {
        remaining.splice(index, 1);
      }
      pairings.push({
        round,
        player1Id: byePlayer,
        player2Id: null,
        status: "COMPLETED",
        result: "PLAYER1",
      });
    }
  }

  while (remaining.length > 1) {
    const player1Id = remaining.shift() as string;
    const opponents = opponentMap.get(player1Id) ?? new Set<string>();
    let opponentIndex = remaining.findIndex(
      (candidate) => !opponents.has(candidate),
    );
    if (opponentIndex === -1) {
      opponentIndex = 0;
    }
    const player2Id = remaining.splice(opponentIndex, 1)[0];
    pairings.push({
      round,
      player1Id,
      player2Id,
      status: "SCHEDULED",
      result: null,
    });
  }

  return pairings;
}
