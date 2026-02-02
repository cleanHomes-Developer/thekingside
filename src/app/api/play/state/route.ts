import { NextResponse } from "next/server";
import { getPlayState } from "@/lib/play/state";

export async function GET() {
  const state = await getPlayState();
  return NextResponse.json(state);
}
