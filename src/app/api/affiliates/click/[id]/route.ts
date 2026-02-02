import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";

type RouteContext = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const program = await prisma.affiliateProgram.findUnique({
    where: { id: params.id },
  });
  if (!program || !program.enabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    null;

  await prisma.affiliateClick.create({
    data: {
      programId: program.id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
    },
  });

  return NextResponse.redirect(program.affiliateUrl);
}
