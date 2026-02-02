import { NextResponse } from "next/server";
import { buildMatchSnapshot } from "@/lib/play/match";

type Params = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: Params) {
  const match = await buildMatchSnapshot(params.id);
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  return NextResponse.json({ match });
}
