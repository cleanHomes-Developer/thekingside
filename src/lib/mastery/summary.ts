type ScoreEntry = {
  key: string;
  xp: number;
};

export function selectStrengthsWeaknesses(
  scores: ScoreEntry[],
  limit = 3,
) {
  const strengths = [...scores].sort((a, b) => b.xp - a.xp);
  const topStrengths = strengths.slice(0, limit).map((item) => item.key);

  const weaknesses = [...scores].sort((a, b) => a.xp - b.xp);
  const topWeaknesses = weaknesses
    .filter((item) => !topStrengths.includes(item.key))
    .slice(0, limit)
    .map((item) => item.key);

  return { strengths: topStrengths, weaknesses: topWeaknesses };
}

