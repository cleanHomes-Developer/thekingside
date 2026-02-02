import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import AdminAnticheatTable from "./AdminAnticheatTable";

export default async function AdminAnticheatPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const cases = await prisma.antiCheatCase.findMany({
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
            <h1 className="text-3xl font-semibold">Anti-cheat cases</h1>
            <p className="text-white/60">
              Review flags, handle appeals, and clear payout holds.
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
          <AdminAnticheatTable
            cases={cases.map((caseItem) => ({
              id: caseItem.id,
              userDisplayName: caseItem.user.displayName,
              tournamentName: caseItem.tournament.name,
              status: caseItem.status,
              riskLevel: caseItem.riskLevel,
              createdAt: caseItem.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
