import crypto from "crypto";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MINUTES = 60;

export function generateToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getExpiry(minutes = TOKEN_TTL_MINUTES) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
  return expiresAt;
}
