import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { enforceTournamentLock } from "@/lib/tournaments/lock";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getSessionFromCookies } from "@/lib/auth/session";
import EnterTournamentButton from "./EnterTournamentButton";
import { buildStandings } from "@/lib/tournaments/standings";
import AntiCheatReportForm from "./AntiCheatReportForm";
import { getSeasonConfig } from "@/lib/season";
import { getSwissRounds } from "@/lib/tournaments/swiss";
import CheckInButton from "./CheckInButton";
import CountdownBadge from "../CountdownBadge";
import ScheduleTimeline from "./ScheduleTimeline";

type TournamentPageProps = {
  params: { id: string };
};

type MatchStatus = "IN_PROGRESS" | "COMPLETED" | "PENDING" | string;

type MatchSummary = {
  id: string;
  round: number;
  player1Id: string;
  player2Id: string | null;
  status: MatchStatus;
  result: string | null;
  lichessGameId: string | null;
};

function getDisplayName(
  entries: { userId: string; user: { displayName: string } }[],
  userId: string | null,
) {
  if (!userId) {
    return "BYE";
  }
  return entries.find((item) => item.userId === userId)?.user.displayName ?? "TBD";
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  await enforceTournamentLock(params.id);

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
  });

  if (!tournament) {
    notFound();
  }

  const session = await getSessionFromCookies();
  const season = await getSeasonConfig();
  const isFreeSeason = season.mode === "free";
  const matchLimit = 200;
  const [entry, entries, waitlistEntries, matches, standingsMatches] =
    await Promise.all([
    session?.sub
      ? prisma.entry.findUnique({
          where: {
            userId_tournamentId: {
              userId: session.sub,
              tournamentId: tournament.id,
            },
          },
        })
      : Promise.resolve(null),
    prisma.entry.findMany({
      where: { tournamentId: tournament.id, status: "CONFIRMED" },
      include: { user: true },
    }),
    prisma.entry.findMany({
      where: { tournamentId: tournament.id, status: "WAITLIST" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.match.findMany({
      where: { tournamentId: tournament.id },
      orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
      take: matchLimit,
    }),
    prisma.match.findMany({
      where: { tournamentId: tournament.id },
      select: { player1Id: true, player2Id: true, result: true },
    }),
  ]);

  const now = new Date();
  const locked = tournament.lockAt <= now;
  const checkInOpensAt = new Date(tournament.startDate);
  checkInOpensAt.setMinutes(checkInOpensAt.getMinutes() - 20);
  const checkInOpen = now >= checkInOpensAt && now <= tournament.lockAt;
  const waitlistPosition =
    entry?.status === "WAITLIST"
      ? waitlistEntries.findIndex((item) => item.userId === entry.userId) + 1
      : null;
  const seatsLeft = Math.max(tournament.maxPlayers - tournament.currentPlayers, 0);

  const summaries: MatchSummary[] = matches.map((match) => ({
    id: match.id,
    round: match.round,
    player1Id: match.player1Id,
    player2Id: match.player2Id,
    status: match.status as MatchStatus,
    result: match.result,
    lichessGameId: match.lichessGameId,
  }));

  const liveMatches = summaries.filter((match) => match.status === "IN_PROGRESS");
  const completedMatches = summaries.filter(
    (match) => match.status === "COMPLETED",
  );
  const upcomingMatches = summaries.filter(
    (match) => match.status !== "IN_PROGRESS" && match.status !== "COMPLETED",
  );

  const rounds = summaries.map((match) => match.round);
  const maxRound = rounds.length ? Math.max(...rounds) : 0;
  const liveRounds = liveMatches.map((match) => match.round);
  const currentRound = liveRounds.length ? Math.min(...liveRounds) : maxRound;
  const totalRounds = getSwissRounds(entries.length);

  const standings = buildStandings(
    entries.map((item) => ({ userId: item.userId })),
    standingsMatches.map((match) => ({
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      result: match.result as "PLAYER1" | "PLAYER2" | "DRAW" | null,
    })),
  );

  return (
    <div className="min-h-screen bg-[#070b16] px-6 py-14 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <Link
          href="/tournaments"
          className="text-sm text-white/60 transition hover:text-cyan-200"
        >
          Back to tournaments
        </Link>

        <section className="rounded-[28px] border border-cyan-400/20 bg-gradient-to-br from-[#0c1527] via-[#0f1d34] to-[#0b1220] p-6 shadow-[0_0_30px_rgba(0,217,255,0.12)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">
                {tournament.type} - Day {tournament.slotKey || "01"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
                {tournament.name}
              </h1>
              <p className="mt-2 text-white/60">
                {tournament.description ?? "No description provided."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <CountdownBadge
                  target={tournament.startDate.toISOString()}
                  label="Starts in"
                />
                <CountdownBadge
                  target={tournament.lockAt.toISOString()}
                  label="Locks in"
                />
              </div>
            </div>
            <div className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-100">
              {tournament.status.replace("_", " ")}
            </div>
          </div>
          {locked ? (
            <div className="mt-4 rounded-2xl border border-amber-300/30 bg-[rgba(24,22,12,0.6)] px-4 py-3 text-xs text-amber-100">
              Registration is locked. Bracket is finalized.
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-[#0a111f]/70 p-4 text-xs text-white/60 md:grid-cols-3">
            <div>
              <p>Status</p>
              <p className="mt-1 text-sm text-white/80">
                {tournament.status.replace("_", " ")}
              </p>
            </div>
            <div>
              <p>Matches</p>
              <p className="mt-1 text-sm text-white/80">
                {completedMatches.length}/{summaries.length} completed
              </p>
            </div>
            <div>
              <p>Round</p>
              <p className="mt-1 text-sm text-white/80">
                {currentRound || 1} of {totalRounds || 1}
              </p>
            </div>
            <div>
              <p>Players</p>
              <p className="mt-1 text-sm text-white/80">
                {entries.length}/{tournament.maxPlayers}
              </p>
            </div>
            <div>
              <p>Seats left</p>
              <p className="mt-1 text-sm text-white/80">{seatsLeft}</p>
            </div>
            <div>
              <p>Time control</p>
              <p className="mt-1 text-sm text-white/80">
                {tournament.timeControl || "TBD"}
              </p>
            </div>
            <div>
              <p>Entry</p>
              <p className="mt-1 text-sm text-white/80">
                {isFreeSeason ? "Free" : formatCurrency(tournament.entryFee.toString())}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0a111f]/80 p-6">
              <h2 className="text-sm font-semibold text-cyan-200">
                Live matches ({liveMatches.length})
              </h2>
              {liveMatches.length === 0 ? (
                <p className="mt-3 text-sm text-white/60">No live matches yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {liveMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                          Round {match.round}
                        </p>
                        <p className="text-sm text-white/80">
                          {getDisplayName(entries, match.player1Id)} vs{" "}
                          {getDisplayName(entries, match.player2Id)}
                        </p>
                      </div>
                      {match.lichessGameId ? (
                        <a
                          href={`https://lichess.org/${match.lichessGameId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-cyan-300/40 px-4 py-1 text-xs text-cyan-100"
                        >
                          Watch
                        </a>
                      ) : (
                        <span className="rounded-full border border-white/15 px-4 py-1 text-xs text-white/40">
                          Watch
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a111f]/80 p-6">
              <h2 className="text-sm font-semibold text-cyan-200">
                Completed matches ({completedMatches.length})
              </h2>
              {completedMatches.length === 0 ? (
                <p className="mt-3 text-sm text-white/60">
                  No completed matches yet.
                </p>
              ) : (
                <div className="mt-4 space-y-2 text-xs text-white/70">
                  {completedMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2"
                    >
                      <span>
                        {getDisplayName(entries, match.player1Id)} vs{" "}
                        {getDisplayName(entries, match.player2Id)}
                      </span>
                      <span className="text-cyan-100">
                        {match.result ?? "Result pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0a111f]/80 p-6">
              <h2 className="text-sm font-semibold text-cyan-200">Standings</h2>
              {standings.length === 0 ? (
                <p className="mt-3 text-sm text-white/60">No standings yet.</p>
              ) : (
                <div className="mt-4 space-y-2 text-xs text-white/70">
                  {standings.map((standing, index) => {
                    const entryUser = entries.find(
                      (item) => item.userId === standing.userId,
                    );
                    return (
                      <div
                        key={standing.userId}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2"
                      >
                        <span>
                          {index + 1}. {entryUser?.user.displayName ?? "Unknown"}
                        </span>
                        <span className="text-white/50">
                          {standing.points} pts | {standing.wins}W/
                          {standing.draws}D/{standing.losses}L
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a111f]/80 p-6 text-sm text-white/70">
              <h2 className="text-sm font-semibold text-cyan-200">
                Registration
              </h2>
              <div className="mt-4 space-y-3">
                <p className="text-xs text-white/50">
                  Steps: Register, check in, lock, play.
                </p>
                <ScheduleTimeline
                  checkInOpensAt={checkInOpensAt.toISOString()}
                  lockAt={tournament.lockAt.toISOString()}
                  startAt={tournament.startDate.toISOString()}
                />
                <p>
                  <span className="text-white/50">Starts:</span>{" "}
                  {formatDateTime(tournament.startDate)}
                </p>
                <p>
                  <span className="text-white/50">Lock at:</span>{" "}
                  {formatDateTime(tournament.lockAt)}
                </p>
                <p>
                  <span className="text-white/50">Check-in opens:</span>{" "}
                  {formatDateTime(checkInOpensAt)}
                </p>
                <p>
                  <span className="text-white/50">Min players:</span>{" "}
                  {tournament.minPlayers}
                </p>
                <p>
                  <span className="text-white/50">Waitlist:</span>{" "}
                  {waitlistEntries.length}
                </p>
                {tournament.status === "CANCELLED" ? (
                  <p className="text-red-300">
                    This tournament was cancelled due to low registration.
                  </p>
                ) : entry ? (
                  <p className="text-green-300">
                    {entry.status === "WAITLIST"
                      ? "You are on the waitlist."
                      : "You are registered for this tournament."}
                  </p>
                ) : session ? (
                  <>
                    <p>
                      {locked
                        ? "Registration is locked."
                        : "Ready to join the bracket?"}
                    </p>
                    {!locked ? (
                      <EnterTournamentButton
                        tournamentId={tournament.id}
                        isFreeSeason={isFreeSeason}
                      />
                    ) : null}
                  </>
                ) : (
                  <p>
                    <Link className="text-cyan-300" href="/login">
                      Sign in
                    </Link>{" "}
                    to enter this tournament.
                  </p>
                )}
                {entry && entry.status !== "CANCELLED" ? (
                  <CheckInButton
                    tournamentId={tournament.id}
                    checkedInAt={entry.checkedInAt?.toISOString() ?? null}
                    disabled={!checkInOpen || locked}
                  />
                ) : null}
                {entry?.status === "WAITLIST" && waitlistPosition ? (
                  <p className="text-xs text-white/50">
                    Waitlist position: {waitlistPosition} of{" "}
                    {waitlistEntries.length}
                  </p>
                ) : null}
                <p className="text-xs text-white/50">
                  Refunds are available before lock.{" "}
                  <Link href="/refund-policy" className="text-cyan-200">
                    View policy
                  </Link>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a111f]/80 p-6 text-sm text-white/70">
              <h2 className="text-sm font-semibold text-cyan-200">
                Upcoming matches
              </h2>
              {upcomingMatches.length === 0 ? (
                <p className="mt-3 text-sm text-white/60">No upcoming matches.</p>
              ) : (
                <div className="mt-4 space-y-2 text-xs text-white/70">
                  {upcomingMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2"
                    >
                      <span>
                        {getDisplayName(entries, match.player1Id)} vs{" "}
                        {getDisplayName(entries, match.player2Id)}
                      </span>
                      <span className="text-white/50">Round {match.round}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        {session ? (
          <AntiCheatReportForm tournamentId={tournament.id} />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0a111f]/80 p-6 text-sm text-white/70">
            <p>
              Sign in to report suspicious play and submit an anti-cheat case.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
