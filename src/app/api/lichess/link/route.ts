import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireUser } from "@/lib/auth/guards";
import { getLichessConfig, getLichessBaseUrl } from "@/lib/lichess/client";
import { cookies } from "next/headers";

const STATE_COOKIE = "tks_lichess_state";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getLichessConfig();
  if (!config) {
    return NextResponse.json(
      { error: "Lichess OAuth not configured" },
      { status: 503 },
    );
  }

  const state = randomUUID();
  cookies().set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/lichess/callback`;
  const authUrl = new URL(`${getLichessBaseUrl()}/oauth`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "challenge:write game:read");

  return NextResponse.redirect(authUrl.toString());
}
