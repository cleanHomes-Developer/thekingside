export type LichessGame = {
  status: string;
  winner?: "white" | "black";
};

export function mapLichessResult(game: LichessGame | null) {
  if (!game) {
    return null;
  }

  if (
    game.status !== "mate" &&
    game.status !== "draw" &&
    game.status !== "resign" &&
    game.status !== "timeout"
  ) {
    return null;
  }

  if (!game.winner) {
    return "DRAW";
  }

  return game.winner === "white" ? "PLAYER1" : "PLAYER2";
}
