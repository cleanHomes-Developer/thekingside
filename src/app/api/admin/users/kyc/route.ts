import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

type Payload = {
  userId?: string;
  kycStatus?: "PENDING" | "VERIFIED" | "REJECTED";
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

  if (!payload.userId || !payload.kycStatus) {
    return NextResponse.json(
      { error: "userId and kycStatus required" },
      { status: 400 },
    );
  }

  const requestMeta = getRequestMeta(request);
  const nextVerifiedAt =
    payload.kycStatus === "VERIFIED" ? new Date() : null;

  const result = await prisma.$transaction(async (tx) => {
    const before = await tx.profile.findUnique({
      where: { userId: payload.userId },
    });
    const profile = await tx.profile.upsert({
      where: { userId: payload.userId },
      update: {
        kycStatus: payload.kycStatus,
        kycVerifiedAt: nextVerifiedAt,
      },
      create: {
        userId: payload.userId!,
        kycStatus: payload.kycStatus!,
        kycVerifiedAt: nextVerifiedAt,
      },
    });

    await logAuditEvent(tx, {
      action: "USER_KYC_UPDATE",
      userId: admin.id,
      entityType: "User",
      entityId: payload.userId,
      beforeState: before
        ? {
            kycStatus: before.kycStatus,
            kycVerifiedAt: before.kycVerifiedAt,
          }
        : null,
      afterState: {
        kycStatus: profile.kycStatus,
        kycVerifiedAt: profile.kycVerifiedAt,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return profile;
  });

  return NextResponse.json({
    userId: result.userId,
    kycStatus: result.kycStatus,
  });
}
