import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

export default async function MyAntiCheatCasesPage() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const cases = await prisma.antiCheatCase.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { tournament: true },
  });

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              My cases
            </p>
            <h1 className="text-3xl font-semibold">Anti-cheat reports</h1>
            <p className="text-white/60">
              Track your reports, status updates, and appeal outcomes.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to dashboard
          </Link>
        </header>

        <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
          {cases.length === 0 ? (
            <p className="text-sm text-white/60">
              You have not submitted any reports yet.
            </p>
          ) : (
            <div className="space-y-3 text-sm text-white/70">
              {cases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/anticheat/${caseItem.id}`}
                  className="block rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 transition hover:border-cyan-300/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        {caseItem.riskLevel} risk - {caseItem.status}
                      </p>
                      <p className="text-base font-semibold text-white">
                        {caseItem.tournament.name}
                      </p>
                    </div>
                    <span className="text-xs text-white/40">
                      {caseItem.createdAt.toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
