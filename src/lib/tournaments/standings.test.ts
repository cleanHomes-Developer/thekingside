import { describe, expect, it } from "vitest";
import { buildStandings } from "./standings";

describe("standings", () => {
  it("ranks players by wins and losses", () => {
    const standings = buildStandings(
      [{ userId: "a" }, { userId: "b" }, { userId: "c" }],
      [
        { player1Id: "a", player2Id: "b", result: "PLAYER1" },
        { player1Id: "b", player2Id: "c", result: "PLAYER2" },
        { player1Id: "a", player2Id: "c", result: "DRAW" },
      ],
    );

    expect(standings[0].userId).toBe("a");
    expect(standings[0].wins).toBe(1);
    expect(standings[0].points).toBe(1.5);
    expect(standings[1].userId).toBe("c");
    expect(standings[2].userId).toBe("b");
  });
});
