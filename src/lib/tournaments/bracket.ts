export type BracketEntry = {
  userId: string;
};

export type BracketMatch = {
  round: number;
  player1Id: string;
  player2Id: string;
};

export function isPowerOfTwo(value: number) {
  return value > 0 && (value & (value - 1)) === 0;
}

export function generateBracket(entries: BracketEntry[]) {
  if (!isPowerOfTwo(entries.length)) {
    return null;
  }

  const matches: BracketMatch[] = [];
  for (let i = 0; i < entries.length; i += 2) {
    matches.push({
      round: 1,
      player1Id: entries[i].userId,
      player2Id: entries[i + 1].userId,
    });
  }

  return matches;
}
