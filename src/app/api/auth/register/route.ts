import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { registerSchema, normalizeEmail } from "@/lib/auth/validation";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { rateLimit } from "@/lib/rate-limit";
import { generateToken, getExpiry, hashToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/auth";

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const limit = rateLimit(request, {
    keyPrefix: "auth:register",
    windowMs: 60_000,
    max: 5,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": limit.retryAfter.toString() },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: parsed.data.name,
      displayName: parsed.data.displayName,
      emailVerifiedAt: null,
      profile: {
        create: {},
      },
    },
  });

  try {
    const token = generateToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: getExpiry(60),
      },
    });
    await sendVerificationEmail(user.email, token);
  } catch {
    // Ignore email verification failures.
  }

  const token = await createSessionToken({ sub: user.id, role: user.role });
  setSessionCookie(token);

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        role: user.role,
      },
    },
    { status: 201 },
  );
}
