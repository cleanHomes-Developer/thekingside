import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { exchangeLichessToken, fetchLichessAccount } from "@/lib/lichess/client";

const STATE_COOKIE = "tks_lichess_state";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = cookies().get(STATE_COOKIE)?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
  }

  cookies().set(STATE_COOKIE, "", { maxAge: 0, path: "/" });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/lichess/callback`;
  const token = await exchangeLichessToken(code, redirectUri);
  const account = await fetchLichessAccount(token.access_token);

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      lichessUsername: account.username,
      lichessUserId: account.id,
      lichessAccessToken: token.access_token,
      lichessTokenCreatedAt: new Date(),
      lichessLinkedAt: new Date(),
    },
    update: {
      lichessUsername: account.username,
      lichessUserId: account.id,
      lichessAccessToken: token.access_token,
      lichessTokenCreatedAt: new Date(),
      lichessLinkedAt: new Date(),
    },
  });

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?lichess=linked`);
}
