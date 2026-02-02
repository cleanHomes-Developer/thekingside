export type MatchResult = "PLAYER1" | "PLAYER2" | "DRAW";

export type MatchLike = {
  player1Id: string;
  player2Id: string | null;
  result: MatchResult | null;
};

export type EntryLike = {
  userId: string;
};

export type Standing = {
  userId: string;
  wins: number;
  losses: number;
  draws: number;
  matchesPlayed: number;
  points: number;
  buchholz: number;
  sonneborn: number;
  hadBye: boolean;
};

export function buildStandings(entries: EntryLike[], matches: MatchLike[]) {
  const standings = new Map<string, Standing>();
  const opponentMap = new Map<string, Set<string>>();

  for (const entry of entries) {
    standings.set(entry.userId, {
      userId: entry.userId,
      wins: 0,
      losses: 0,
      draws: 0,
      matchesPlayed: 0,
      points: 0,
      buchholz: 0,
      sonneborn: 0,
      hadBye: false,
    });
    opponentMap.set(entry.userId, new Set());
  }

  for (const match of matches) {
    if (!match.result) {
      continue;
    }

    const player1 = standings.get(match.player1Id);
    const player2 = match.player2Id ? standings.get(match.player2Id) : null;
    if (!player1) {
      continue;
    }

    player1.matchesPlayed += 1;
    if (player2) {
      player2.matchesPlayed += 1;
      opponentMap.get(player1.userId)?.add(player2.userId);
      opponentMap.get(player2.userId)?.add(player1.userId);
    }

    if (!player2) {
      player1.wins += 1;
      player1.points += 1;
      player1.hadBye = true;
      continue;
    }

    if (match.result === "PLAYER1") {
      player1.wins += 1;
      player1.points += 1;
      player2.losses += 1;
    } else if (match.result === "PLAYER2") {
      player2.wins += 1;
      player2.points += 1;
      player1.losses += 1;
    } else if (match.result === "DRAW") {
      player1.draws += 1;
      player2.draws += 1;
      player1.points += 0.5;
      player2.points += 0.5;
    }
  }

  for (const [userId, standing] of standings.entries()) {
    const opponents = opponentMap.get(userId) ?? new Set();
    let buchholz = 0;
    let sonneborn = 0;
    for (const opponentId of opponents) {
      const opponent = standings.get(opponentId);
      if (!opponent) {
        continue;
      }
      buchholz += opponent.points;
    }

    for (const match of matches) {
      if (!match.result || !match.player2Id) {
        continue;
      }
      if (match.player1Id !== userId && match.player2Id !== userId) {
        continue;
      }
      const opponentId =
        match.player1Id === userId ? match.player2Id : match.player1Id;
      const opponent = standings.get(opponentId);
      if (!opponent) {
        continue;
      }
      if (
        (match.result === "PLAYER1" && match.player1Id === userId) ||
        (match.result === "PLAYER2" && match.player2Id === userId)
      ) {
        sonneborn += opponent.points;
      } else if (match.result === "DRAW") {
        sonneborn += opponent.points * 0.5;
      }
    }

    standing.buchholz = buchholz;
    standing.sonneborn = sonneborn;
  }

  return Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.buchholz !== a.buchholz) {
      return b.buchholz - a.buchholz;
    }
    if (b.sonneborn !== a.sonneborn) {
      return b.sonneborn - a.sonneborn;
    }
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    if (a.losses !== b.losses) {
      return a.losses - b.losses;
    }
    return a.userId.localeCompare(b.userId);
  });
}
