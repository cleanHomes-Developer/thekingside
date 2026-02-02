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

export default async function TournamentsPage() {
  await enforceTournamentLocks();
  const season = await getSeasonConfig();
  const isFreeSeason = season.mode === "free";
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: "asc" },
  });
  const nextTournament = tournaments.find(
    (tournament) => new Date(tournament.startDate).getTime() > Date.now(),
  );

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

        {isFreeSeason ? (
          <div className="rounded-2xl border border-cyan-400/30 bg-[rgba(15,23,42,0.7)] p-5 text-sm text-cyan-100">
            Free season is live: entry fees are waived and prize pools start at{" "}
            {formatCurrency(season.freePrizePool.toString())}.
          </div>
        ) : null}

        {tournaments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-white/70">
            No tournaments scheduled yet. Check back soon.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {tournaments.map((tournament) => (
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
