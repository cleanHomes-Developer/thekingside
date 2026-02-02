import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import AdminAnticheatCaseActions from "./AdminAnticheatCaseActions";
import { getLichessBaseUrl } from "@/lib/lichess/client";

type AdminCasePageProps = {
  params: { id: string };
};

function safeParseEvidence(evidence: string) {
  try {
    return JSON.parse(evidence) as Record<string, unknown>;
  } catch {
    return { raw: evidence };
  }
}

export default async function AdminAnticheatCasePage({
  params,
}: AdminCasePageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const caseItem = await prisma.antiCheatCase.findUnique({
    where: { id: params.id },
    include: { user: true, tournament: true, match: true },
  });

  if (!caseItem) {
    notFound();
  }

  const evidence = safeParseEvidence(caseItem.evidence);
  const userHistory = await prisma.antiCheatCase.findMany({
    where: {
      userId: caseItem.userId,
      id: { not: caseItem.id },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { tournament: true },
  });

  const matchData = caseItem.matchId
    ? await prisma.match.findUnique({
        where: { id: caseItem.matchId },
      })
    : null;

  const [player1, player2] = matchData
    ? await Promise.all([
        prisma.user.findUnique({ where: { id: matchData.player1Id } }),
        matchData.player2Id
          ? prisma.user.findUnique({ where: { id: matchData.player2Id } })
          : Promise.resolve(null),
      ])
    : [null, null];

  const lichessUrl =
    matchData?.lichessGameId && !matchData.lichessGameId.startsWith("dev-")
      ? `${getLichessBaseUrl()}/${matchData.lichessGameId}`
      : null;

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Anti-cheat case
            </p>
            <h1 className="text-3xl font-semibold">
              {caseItem.user.displayName} - {caseItem.tournament.name}
            </h1>
            <p className="text-white/60">
              {caseItem.status} - {caseItem.riskLevel}
            </p>
          </div>
          <Link
            href="/admin/anticheat"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to cases
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">Evidence</h2>
            <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/60 p-4 text-xs text-white/70">
              {JSON.stringify(evidence, null, 2)}
            </pre>
            {caseItem.appealText ? (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-cyan-200">
                  Appeal
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {caseItem.appealText}
                </p>
              </div>
            ) : null}

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-cyan-200">
                Match highlights
              </h3>
              {matchData ? (
                <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-white/70">
                  <p>
                    <span className="text-white/50">Match ID:</span>{" "}
                    {matchData.id}
                  </p>
                  <p>
                    <span className="text-white/50">Players:</span>{" "}
                    {player1?.displayName ?? matchData.player1Id} vs{" "}
                    {matchData.player2Id
                      ? player2?.displayName ?? matchData.player2Id
                      : "BYE"}
                  </p>
                  <p>
                    <span className="text-white/50">Round:</span>{" "}
                    {matchData.round}
                  </p>
                  <p>
                    <span className="text-white/50">Status:</span>{" "}
                    {matchData.status}
                  </p>
                  <p>
                    <span className="text-white/50">Result:</span>{" "}
                    {matchData.result ?? "Pending"}
                  </p>
                  <p>
                    <span className="text-white/50">Lichess game:</span>{" "}
                    {lichessUrl ? (
                      <a
                        className="text-cyan-300"
                        href={lichessUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {matchData.lichessGameId}
                      </a>
                    ) : (
                      matchData.lichessGameId ?? "Not linked"
                    )}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-white/60">
                  No match data available.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-base font-semibold text-cyan-200">Details</h2>
            <div className="mt-4 space-y-2 text-sm text-white/70">
              <p>
                <span className="text-white/50">Case ID:</span> {caseItem.id}
              </p>
              <p>
                <span className="text-white/50">User:</span>{" "}
                {caseItem.user.displayName}
              </p>
              <p>
                <span className="text-white/50">Tournament:</span>{" "}
                {caseItem.tournament.name}
              </p>
              <p>
                <span className="text-white/50">Match:</span>{" "}
                {caseItem.matchId ? (
                  <Link
                    className="text-cyan-300"
                    href={`/tournaments/${caseItem.tournamentId}?match=${caseItem.matchId}`}
                  >
                    {caseItem.matchId}
                  </Link>
                ) : (
                  "Not linked"
                )}
              </p>
              <p>
                <span className="text-white/50">Opened:</span>{" "}
                {caseItem.createdAt.toLocaleString()}
              </p>
              <p>
                <span className="text-white/50">Resolved:</span>{" "}
                {caseItem.resolvedAt?.toLocaleString() ?? "Open"}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-cyan-200">
                Admin actions
              </h3>
              <div className="mt-3">
                <AdminAnticheatCaseActions
                  caseId={caseItem.id}
                  initialNotes={caseItem.adminNotes}
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-cyan-200">
                User history
              </h3>
              {userHistory.length === 0 ? (
                <p className="mt-2 text-sm text-white/60">
                  No other cases for this user.
                </p>
              ) : (
                <div className="mt-3 space-y-2 text-sm text-white/70">
                  {userHistory.map((item) => (
                    <Link
                      key={item.id}
                      href={`/admin/anticheat/${item.id}`}
                      className="block rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 transition hover:border-cyan-300/60"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        {item.riskLevel} risk - {item.status}
                      </p>
                      <p className="text-sm text-white/80">
                        {item.tournament.name}
                      </p>
                      <p className="text-xs text-white/40">
                        {item.createdAt.toLocaleString()}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
