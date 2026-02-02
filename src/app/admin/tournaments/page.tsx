import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import AdminTournamentForm from "./AdminTournamentForm";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getSeasonConfig } from "@/lib/season";

export default async function AdminTournamentsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: "desc" },
  });
  const season = await getSeasonConfig();
  const isFreeSeason = season.mode === "free";

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Admin
            </p>
            <h1 className="text-3xl font-semibold">Tournament control</h1>
            <p className="text-white/60">
              Create and manage daily tournament schedules.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to admin
          </Link>
        </header>

        <AdminTournamentForm
          isFreeSeason={isFreeSeason}
          freePrizePool={season.freePrizePool}
        />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-cyan-200">
            Existing tournaments
          </h2>
          {tournaments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-white/70">
              No tournaments yet.
            </div>
          ) : (
            <div className="space-y-3">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-5 text-sm text-white/70"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                      {tournament.type}
                    </p>
                    <p className="text-base font-semibold text-white">
                      {tournament.name}
                    </p>
                    <p className="text-white/50">
                      {formatDateTime(tournament.startDate)} -{" "}
                      {isFreeSeason
                        ? "Free"
                        : formatCurrency(tournament.entryFee.toString())}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
                      {tournament.status.replace("_", " ")}
                    </span>
                    <Link
                      href={`/admin/tournaments/${tournament.id}`}
                      className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/ledger/${tournament.id}`}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-cyan-300"
                    >
                      Ledger
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}



