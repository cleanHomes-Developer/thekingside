import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
