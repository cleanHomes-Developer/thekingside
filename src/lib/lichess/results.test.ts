import { describe, expect, it } from "vitest";
import { mapLichessResult } from "./results";

describe("lichess result mapping", () => {
  it("returns null for unfinished games", () => {
    expect(mapLichessResult({ status: "started" })).toBeNull();
  });

  it("maps draws", () => {
    expect(mapLichessResult({ status: "draw" })).toBe("DRAW");
  });

  it("maps winners to player slots", () => {
    expect(mapLichessResult({ status: "mate", winner: "white" })).toBe(
      "PLAYER1",
    );
    expect(mapLichessResult({ status: "resign", winner: "black" })).toBe(
      "PLAYER2",
    );
  });
});
