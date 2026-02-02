import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import AppealForm from "./AppealForm";

type AntiCheatCasePageProps = {
  params: { id: string };
};

function safeParseEvidence(evidence: string) {
  try {
    return JSON.parse(evidence) as Record<string, unknown>;
  } catch {
    return { raw: evidence };
  }
}

export default async function AntiCheatCasePage({
  params,
}: AntiCheatCasePageProps) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const caseItem = await prisma.antiCheatCase.findUnique({
    where: { id: params.id },
    include: { tournament: true },
  });

  if (!caseItem || caseItem.userId !== user.id) {
    notFound();
  }

  const evidence = safeParseEvidence(caseItem.evidence);

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Anti-cheat case
            </p>
            <h1 className="text-3xl font-semibold">{caseItem.tournament.name}</h1>
            <p className="text-white/60">
              Status: {caseItem.status} - {caseItem.riskLevel}
            </p>
          </div>
          <Link
            href={`/tournaments/${caseItem.tournamentId}`}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to tournament
          </Link>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
          <h2 className="text-base font-semibold text-cyan-200">
            Evidence on file
          </h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/60 p-4 text-xs text-white/70">
            {JSON.stringify(evidence, null, 2)}
          </pre>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-base font-semibold text-cyan-200">Appeal</h2>
          <p className="mt-2 text-sm text-white/60">
            Appeals are reviewed by admins. If approved, your payout hold will be
            lifted.
          </p>
          <div className="mt-4">
            <AppealForm
              caseId={caseItem.id}
              status={caseItem.status}
              appealText={caseItem.appealText}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
