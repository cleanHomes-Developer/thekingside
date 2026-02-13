import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { generateToken, getExpiry, hashToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/auth";

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: true });
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = getExpiry(60);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const result = await sendVerificationEmail(user.email, token);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Email delivery failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
