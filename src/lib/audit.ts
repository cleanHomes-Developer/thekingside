import type { Prisma, PrismaClient } from "@prisma/client";
import type { NextRequest } from "next/server";

type AuditInput = {
  action: string;
  userId?: string | null;
  entityType: string;
  entityId?: string | null;
  beforeState?: Prisma.InputJsonValue | null;
  afterState?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type AuditClient = PrismaClient | Prisma.TransactionClient;

export function getRequestMeta(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    null;
  const userAgent = request.headers.get("user-agent");
  return { ipAddress: ip, userAgent };
}

export async function logAuditEvent(
  tx: AuditClient,
  input: AuditInput,
) {
  await tx.auditLog.create({
    data: {
      action: input.action,
      userId: input.userId ?? null,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      beforeState: input.beforeState ?? undefined,
      afterState: input.afterState ?? undefined,
      ipAddress: input.ipAddress ?? undefined,
      userAgent: input.userAgent ?? undefined,
    },
  });
}

