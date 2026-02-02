import { describe, expect, it } from "vitest";
import { generateBracket, isPowerOfTwo } from "./bracket";

describe("bracket generation", () => {
  it("detects power-of-two sizes", () => {
    expect(isPowerOfTwo(1)).toBe(true);
    expect(isPowerOfTwo(2)).toBe(true);
    expect(isPowerOfTwo(3)).toBe(false);
    expect(isPowerOfTwo(8)).toBe(true);
  });

  it("returns null when entries are not power of two", () => {
    const bracket = generateBracket([
      { userId: "a" },
      { userId: "b" },
      { userId: "c" },
    ]);
    expect(bracket).toBeNull();
  });

  it("pairs entries into round one matches", () => {
    const bracket = generateBracket([
      { userId: "a" },
      { userId: "b" },
      { userId: "c" },
      { userId: "d" },
    ]);

    expect(bracket).toEqual([
      { round: 1, player1Id: "a", player2Id: "b" },
      { round: 1, player1Id: "c", player2Id: "d" },
    ]);
  });
});
