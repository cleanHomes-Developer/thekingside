import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getLichessBaseUrl } from "@/lib/lichess/client";

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const platformToken = process.env.LICHESS_PLATFORM_TOKEN ?? "";
  if (!platformToken) {
    return NextResponse.json(
      { error: "Lichess platform token not configured" },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { level, clockLimit, clockIncrement, color } = payload as {
    level?: number;
    clockLimit?: number;
    clockIncrement?: number;
    color?: "white" | "black" | "random";
  };

  const response = await fetch(`${getLichessBaseUrl()}/api/challenge/ai`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${platformToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      level: String(Math.min(Math.max(level ?? 3, 1), 8)),
      "clock.limit": String(clockLimit ?? 300),
      "clock.increment": String(clockIncrement ?? 0),
      color: color ?? "random",
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to create Lichess AI game" },
      { status: 502 },
    );
  }

  const text = await response.text();
  let data: {
    challenge?: { id?: string; url?: string };
    id?: string;
    url?: string;
  } | null = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  const challengeId = data?.challenge?.id ?? data?.id ?? null;
  const url =
    data?.challenge?.url ??
    data?.url ??
    (challengeId ? `${getLichessBaseUrl()}/${challengeId}` : null);

  if (!url) {
    return NextResponse.json(
      { error: "Lichess AI game URL unavailable", details: text.slice(0, 200) },
      { status: 500 },
    );
  }

  return NextResponse.json({ url });
}
