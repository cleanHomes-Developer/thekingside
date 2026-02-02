import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import AdminPayoutTable from "./AdminPayoutTable";
import { formatCurrency } from "@/lib/format";

export default async function AdminPayoutsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const payouts = await prisma.payout.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, tournament: true },
  });

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Admin
            </p>
            <h1 className="text-3xl font-semibold">Payout approvals</h1>
            <p className="text-white/60">
              Review payout requests and approve transfers.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to admin
          </Link>
        </header>

        <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
          <AdminPayoutTable
            payouts={payouts.map((payout) => ({
              id: payout.id,
              userDisplayName: payout.user.displayName,
              tournamentName: payout.tournament.name,
              amount: formatCurrency(payout.amount.toString()),
              status: payout.status,
              antiCheatHold: payout.antiCheatHold,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
