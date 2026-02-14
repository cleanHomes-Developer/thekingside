import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

type Payload = {
  userId?: string;
};

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const requestMeta = getRequestMeta(request);
  await logAuditEvent(prisma, {
    action: "ADMIN_IMPERSONATE",
    userId: admin.id,
    entityType: "User",
    entityId: user.id,
    beforeState: { adminId: admin.id },
    afterState: { impersonatedUserId: user.id },
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
  });

  const token = await createSessionToken({ sub: user.id, role: user.role });
  setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
