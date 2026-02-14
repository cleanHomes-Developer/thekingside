import { describe, expect, it } from "vitest";
import { parseLichessGame } from "./schema";

describe("parseLichessGame", () => {
  it("accepts valid payloads", () => {
    const payload = parseLichessGame({ status: "mate", winner: "white" });
    expect(payload.status).toBe("mate");
    expect(payload.winner).toBe("white");
  });

  it("accepts payloads without winner", () => {
    const payload = parseLichessGame({ status: "draw" });
    expect(payload.status).toBe("draw");
    expect(payload.winner).toBeUndefined();
  });
});
