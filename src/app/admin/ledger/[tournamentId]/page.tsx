import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { formatCurrency, formatDateTime } from "@/lib/format";

type LedgerPageProps = {
  params: { tournamentId: string };
};

export default async function LedgerPage({ params }: LedgerPageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.tournamentId },
  });
  if (!tournament) {
    redirect("/admin/tournaments");
  }

  const ledgerEntries = await prisma.prizePoolLedger.findMany({
    where: { tournamentId: params.tournamentId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Admin Ledger
            </p>
            <h1 className="text-3xl font-semibold">{tournament.name}</h1>
            <p className="text-white/60">
              Prize pool: {formatCurrency(tournament.prizePool.toString())}
            </p>
          </div>
          <Link
            href="/admin/tournaments"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to tournaments
          </Link>
        </header>

        <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
          {ledgerEntries.length === 0 ? (
            <p className="text-sm text-white/60">No ledger activity yet.</p>
          ) : (
            <div className="space-y-3 text-sm text-white/70">
              {ledgerEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="grid gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 md:grid-cols-[150px_1fr_130px_140px]"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {entry.type.replace("_", " ")}
                  </div>
                  <div>
                    <p className="text-white/80">{entry.description}</p>
                    <p className="text-xs text-white/40">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                  <div
                    className={
                      entry.amount.isNegative()
                        ? "text-red-300"
                        : "text-green-300"
                    }
                  >
                    {formatCurrency(entry.amount.toString())}
                  </div>
                  <div className="text-white/60">
                    Bal: {formatCurrency(entry.balance.toString())}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
