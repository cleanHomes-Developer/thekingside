import { describe, expect, it } from "vitest";
import { loginSchema, normalizeEmail, registerSchema } from "./validation";

describe("auth validation", () => {
  it("normalizes email addresses", () => {
    expect(normalizeEmail("  TEST@Example.com ")).toBe("test@example.com");
  });

  it("accepts valid registration payload", () => {
    const parsed = registerSchema.safeParse({
      email: "player@example.com",
      password: "StrongPass123!",
      name: "Player One",
      displayName: "chessmaster",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects short passwords for login", () => {
    const parsed = loginSchema.safeParse({
      email: "player@example.com",
      password: "short",
    });

    expect(parsed.success).toBe(false);
  });
});
