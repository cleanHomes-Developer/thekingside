import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getSeasonConfig } from "@/lib/season";
import SeasonControl from "./SeasonControl";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }
  const season = await getSeasonConfig();

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Admin
          </p>
          <h1 className="text-3xl font-semibold">Control center</h1>
          <p className="text-white/60">
            Manage tournaments and platform operations.
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/tournaments"
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              Manage tournaments
            </Link>
            <Link
              href="/admin/anticheat"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300"
            >
              Anti-cheat cases
            </Link>
            <Link
              href="/admin/payouts"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300"
            >
              Payouts
            </Link>
            <Link
              href="/admin/support"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300"
            >
              Support tickets
            </Link>
            <Link
              href="/admin/stats"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300"
            >
              Stats
            </Link>
            <Link
              href="/admin/sponsors"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300"
            >
              Sponsors
            </Link>
            <Link
              href="/admin/affiliates"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300"
            >
              Affiliates
            </Link>
            <Link
              href="/admin/demo-tournament"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300"
            >
              Demo tournament
            </Link>
          </div>
        </div>

        <SeasonControl
          mode={season.mode}
          freePrizePool={season.freePrizePool}
          prizeMode={season.prizeMode}
          sponsorshipEnabled={season.sponsorshipEnabled}
          sponsorSlots={season.sponsorSlots}
        />
      </div>
    </div>
  );
}
