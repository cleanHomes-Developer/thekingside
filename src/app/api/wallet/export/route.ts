import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payouts = await prisma.payout.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { tournament: true },
  });

  const rows = [
    ["tournament", "status", "amount", "createdAt"].join(","),
    ...payouts.map((payout) =>
      [
        JSON.stringify(payout.tournament.name),
        payout.status,
        payout.amount.toString(),
        payout.createdAt.toISOString(),
      ].join(","),
    ),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=payouts.csv",
    },
  });
}
