type RatingResult = {
  whiteDelta: number;
  blackDelta: number;
};

const K_FACTOR = 24;

export function calculateEloDelta(
  whiteRating: number,
  blackRating: number,
  result: "WHITE" | "BLACK" | "DRAW",
): RatingResult {
  const expectedWhite =
    1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
  const expectedBlack = 1 - expectedWhite;
  const scoreWhite = result === "WHITE" ? 1 : result === "BLACK" ? 0 : 0.5;
  const scoreBlack = 1 - scoreWhite;
  const whiteDelta = Math.round(K_FACTOR * (scoreWhite - expectedWhite));
  const blackDelta = Math.round(K_FACTOR * (scoreBlack - expectedBlack));

  return { whiteDelta, blackDelta };
}
