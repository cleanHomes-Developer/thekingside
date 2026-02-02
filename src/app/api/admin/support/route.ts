import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, tournament: true },
  });

  return NextResponse.json({
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      userId: ticket.userId,
      userDisplayName: ticket.user.displayName,
      tournamentId: ticket.tournamentId,
      tournamentName: ticket.tournament?.name ?? null,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { ticketId, status, adminNotes } = payload as {
    ticketId?: string;
    status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    adminNotes?: string;
  };

  if (!ticketId || !status) {
    return NextResponse.json(
      { error: "ticketId and status required" },
      { status: 400 },
    );
  }

  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status,
      adminNotes: adminNotes ?? null,
    },
  });

  return NextResponse.json({ ticketId: updated.id });
}
