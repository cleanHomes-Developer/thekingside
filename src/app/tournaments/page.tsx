import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chess Tournaments",
  description:
    "Browse upcoming chess tournaments, brackets, and entry details on The King Side.",
  alternates: {
    canonical: "/tournaments",
  },
  openGraph: {
    title: "Chess Tournaments",
    description:
      "Browse upcoming chess tournaments, brackets, and entry details on The King Side.",
    url: "https://thekingside.com/tournaments",
    siteName: "The King Side",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chess Tournaments",
    description:
      "Browse upcoming chess tournaments, brackets, and entry details on The King Side.",
  },
};
import { prisma } from "@/lib/db";
import { enforceTournamentLocks } from "@/lib/tournaments/lock";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getSeasonConfig } from "@/lib/season";
import CountdownBadge from "./CountdownBadge";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams?: { status?: string; q?: string; tc?: string; fee?: string };
}) {
  try {
    await enforceTournamentLocks();
  } catch {
    // Ignore lock enforcement failures when DB is unavailable.
  }
  const season = await getSeasonConfig();
  const isFreeSeason = season.mode === "free";
  const statusFilter = searchParams?.status?.toUpperCase();
  const queryText = searchParams?.q?.trim() ?? "";
  const timeControlFilter = searchParams?.tc?.trim() ?? "";
  const feeFilter = searchParams?.fee?.trim() ?? "";
  let tournaments: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    entryFee: any;
    minPlayers: number;
    maxPlayers: number;
    currentPlayers: number;
    prizePool: any;
    startDate: Date;
    endDate: Date | null;
    lockAt: Date;
    timeControl: string | null;
    seriesKey: string | null;
    slotKey: string | null;
    description: string | null;
  }> = [];
  try {
    tournaments = await prisma.tournament.findMany({
      where:
        statusFilter && statusFilter !== "ALL"
          ? { status: statusFilter as any }
          : undefined,
      orderBy: { startDate: "asc" },
    });
  } catch {
    tournaments = [];
  }

  const filtered = tournaments.filter((tournament) => {
    if (queryText && !tournament.name.toLowerCase().includes(queryText.toLowerCase())) {
      return false;
    }
    if (timeControlFilter && tournament.timeControl !== timeControlFilter) {
      return false;
    }
    if (feeFilter === "free" && tournament.entryFee && Number(tournament.entryFee) > 0) {
      return false;
    }
    if (feeFilter === "paid" && (!tournament.entryFee || Number(tournament.entryFee) === 0)) {
      return false;
    }
    return true;
  });
  const nextTournament = tournaments.find(
    (tournament) => new Date(tournament.startDate).getTime() > Date.now(),
  );
  const statuses = [
    { label: "All", value: "ALL" },
    { label: "Registration", value: "REGISTRATION" },
    { label: "Live", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];
  const activeStatus = statusFilter ?? "ALL";

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Tournaments
          </p>
          <h1 className="text-3xl font-semibold">Daily brackets</h1>
          <p className="text-white/60">
            Register before lock to secure your seat. Min player rules apply at
            lock time.
          </p>
          {nextTournament ? (
            <div className="pt-2">
              <CountdownBadge
                target={nextTournament.startDate.toISOString()}
                label="Next event in"
              />
            </div>
          ) : null}
        </header>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
            {statuses.map((status) => (
              <Link
                key={status.value}
                href={
                  status.value === "ALL"
                    ? "/tournaments"
                    : `/tournaments?status=${status.value}`
                }
                className={`rounded-full border px-3 py-1 transition ${
                  activeStatus === status.value
                    ? "border-cyan-300/60 text-cyan-100"
                    : "border-white/10 text-white/60 hover:border-cyan-300/40 hover:text-white"
                }`}
              >
                {status.label}
              </Link>
            ))}
          </div>
          <form className="grid gap-3 text-sm text-white/70 md:grid-cols-3">
            <input
              name="q"
              defaultValue={queryText}
              placeholder="Search tournaments"
              className="rounded-lg border border-white/10 bg-[#0b1426] px-3 py-2 text-white/80"
            />
            <input
              name="tc"
              defaultValue={timeControlFilter}
              placeholder="Time control (e.g. 3+2)"
              className="rounded-lg border border-white/10 bg-[#0b1426] px-3 py-2 text-white/80"
            />
            <select
              name="fee"
              defaultValue={feeFilter || "all"}
              className="rounded-lg border border-white/10 bg-[#0b1426] px-3 py-2 text-white/80"
            >
              <option value="all">All fees</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <button
              type="submit"
              className="md:col-span-3 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              Apply filters
            </button>
          </form>
        </div>

        {isFreeSeason ? (
          <div className="rounded-2xl border border-cyan-400/30 bg-[rgba(15,23,42,0.7)] p-5 text-sm text-cyan-100">
            Free season is live: entry fees are waived and prize pools start at{" "}
            {formatCurrency(season.freePrizePool.toString())}.
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-white/70">
            No tournaments scheduled yet. Check back soon.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filtered.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="group rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 transition hover:border-cyan-300/60 hover:shadow-[0_0_25px_rgba(0,217,255,0.18)]"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                  <span>{tournament.type}</span>
                  <span
                    className={
                      tournament.status === "CANCELLED"
                        ? "text-red-300"
                        : tournament.status === "REGISTRATION"
                          ? "text-cyan-300"
                          : "text-white/60"
                    }
                  >
                    {tournament.status.replace("_", " ")}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white group-hover:text-cyan-200">
                  {tournament.name}
                </h2>
                <div className="mt-4 space-y-2 text-sm text-white/70">
                  <p>
                    <span className="text-white/50">Entry fee:</span>{" "}
                    {isFreeSeason
                      ? "Free"
                      : formatCurrency(tournament.entryFee.toString())}
                  </p>
                  <p>
                    <span className="text-white/50">Starts:</span>{" "}
                    {formatDateTime(tournament.startDate)}
                  </p>
                  <p>
                    <span className="text-white/50">Locks:</span>{" "}
                    {formatDateTime(tournament.lockAt)}
                  </p>
                  <p>
                    <span className="text-white/50">Seats:</span>{" "}
                    {tournament.currentPlayers}/{tournament.maxPlayers}
                  </p>
                  <p>
                    <span className="text-white/50">Seats left:</span>{" "}
                    {Math.max(
                      tournament.maxPlayers - tournament.currentPlayers,
                      0,
                    )}
                  </p>
                  {tournament.currentPlayers >= tournament.maxPlayers ? (
                    <p className="text-cyan-200">Waitlist open</p>
                  ) : null}
                  <div className="pt-1">
                    <CountdownBadge
                      target={tournament.lockAt.toISOString()}
                      label="Locks in"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
