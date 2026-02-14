import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { validateSupportPayload } from "@/lib/support/validation";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { subject, description, tournamentId } = payload as {
    subject?: string;
    description?: string;
    tournamentId?: string;
  };

  const validation = validateSupportPayload({ subject, description });
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const requestMeta = getRequestMeta(request);
  const ticket = await prisma.$transaction(async (tx) => {
    const created = await tx.supportTicket.create({
      data: {
        userId: user.id,
        tournamentId: tournamentId ?? null,
        subject: subject!,
        description: description!,
      },
    });

    await logAuditEvent(tx, {
      action: "SUPPORT_TICKET_CREATE",
      userId: user.id,
      entityType: "SupportTicket",
      entityId: created.id,
      afterState: {
        tournamentId: created.tournamentId,
        subject: created.subject,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return created;
  });

  return NextResponse.json({ ticketId: ticket.id }, { status: 201 });
}
