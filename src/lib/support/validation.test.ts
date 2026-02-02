import { describe, expect, it } from "vitest";
import { validateSupportPayload } from "./validation";

describe("support validation", () => {
  it("requires subject and description", () => {
    expect(validateSupportPayload({ subject: "", description: "" }).valid).toBe(
      false,
    );
  });

  it("enforces length limits", () => {
    const longSubject = "x".repeat(201);
    const longDescription = "x".repeat(2001);
    expect(
      validateSupportPayload({
        subject: longSubject,
        description: "ok",
      }).valid,
    ).toBe(false);
    expect(
      validateSupportPayload({
        subject: "ok",
        description: longDescription,
      }).valid,
    ).toBe(false);
  });

  it("accepts valid payloads", () => {
    expect(
      validateSupportPayload({
        subject: "Login issue",
        description: "I cannot access my account.",
      }).valid,
    ).toBe(true);
  });
});
