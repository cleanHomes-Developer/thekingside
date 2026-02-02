import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";

const GUEST_COOKIE = "tks_guest";
const DEFAULT_RATING = 1200;

function makeGuestName(guestKey: string) {
  return `Guest ${guestKey.slice(0, 4).toUpperCase()}`;
}

export async function GET() {
  const session = await getSessionFromCookies();
  if (session?.sub) {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const player = await prisma.casualPlayer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: user.displayName,
        rating: DEFAULT_RATING,
      },
    });

    return NextResponse.json({ player, anonymous: false });
  }

  const cookieStore = cookies();
  let guestKey = cookieStore.get(GUEST_COOKIE)?.value;
  let shouldSetCookie = false;
  if (!guestKey) {
    guestKey = crypto.randomUUID();
    shouldSetCookie = true;
  }

  const player = await prisma.casualPlayer.upsert({
    where: { guestKey },
    update: {},
    create: {
      guestKey,
      displayName: makeGuestName(guestKey),
      rating: DEFAULT_RATING,
    },
  });

  const response = NextResponse.json({ player, anonymous: true });
  if (shouldSetCookie && guestKey) {
    response.cookies.set(GUEST_COOKIE, guestKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return response;
}
