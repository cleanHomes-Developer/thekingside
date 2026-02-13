import { describe, expect, it } from "vitest";
import { selectStrengthsWeaknesses } from "@/lib/mastery/summary";

describe("selectStrengthsWeaknesses", () => {
  it("returns top strengths and weakest non-overlapping skills", () => {
    const scores = [
      { key: "Forks", xp: 12 },
      { key: "Pins", xp: 5 },
      { key: "Endgame", xp: 2 },
      { key: "Openings", xp: 9 },
      { key: "Defense", xp: 1 },
    ];

    const { strengths, weaknesses } = selectStrengthsWeaknesses(scores, 2);

    expect(strengths).toEqual(["Forks", "Openings"]);
    expect(weaknesses).toEqual(["Defense", "Endgame"]);
  });

  it("handles smaller lists without duplication", () => {
    const scores = [
      { key: "Tactics", xp: 4 },
      { key: "Strategy", xp: 4 },
    ];

    const { strengths, weaknesses } = selectStrengthsWeaknesses(scores, 3);

    expect(strengths.length).toBe(2);
    expect(new Set(strengths).size).toBe(2);
    expect(weaknesses.every((item) => !strengths.includes(item))).toBe(true);
  });

  it("returns empty lists when no scores are provided", () => {
    const { strengths, weaknesses } = selectStrengthsWeaknesses([]);

    expect(strengths).toEqual([]);
    expect(weaknesses).toEqual([]);
  });
});
