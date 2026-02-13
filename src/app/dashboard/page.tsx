import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserWithProfile } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { hasAntiCheatHold } from "@/lib/payments/payouts";

export default async function DashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect("/login");
  }

  const [entries, lastMatch, payouts, cases] = await Promise.all([
    prisma.entry.findMany({
      where: { userId: user.id },
      include: { tournament: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.match.findFirst({
      where: {
        status: "COMPLETED",
        OR: [{ player1Id: user.id }, { player2Id: user.id }],
      },
      orderBy: { completedAt: "desc" },
      include: { tournament: true },
    }),
    prisma.payout.findMany({
      where: { userId: user.id, status: "PENDING" },
    }),
    prisma.antiCheatCase.findMany({
      where: { userId: user.id },
    }),
  ]);

  const activeEntries = entries.filter((entry) =>
    ["REGISTRATION", "IN_PROGRESS"].includes(entry.tournament.status),
  );
  const hold = hasAntiCheatHold(cases);

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold">
              Welcome, {user.displayName}
            </h1>
          </div>
          <div className="flex gap-3">
            {user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
              >
                Admin console
              </Link>
            ) : null}
            <Link
              href="/anticheat"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
            >
              My cases
            </Link>
            <Link
              href="/settings"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
            >
              Edit profile
            </Link>
            <Link
              href="/support"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
            >
              Support
            </Link>
            <Link
              href="/tournaments"
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              Browse tournaments
            </Link>
          </div>
        </header>

        {(hold || payouts.length > 0) && (
          <div className="rounded-2xl border border-amber-300/30 bg-[rgba(24,22,12,0.6)] p-5 text-sm text-amber-100">
            {hold ? (
              <p>
                An anti-cheat review is holding payouts. Visit{" "}
                <Link href="/anticheat" className="text-cyan-200">
                  My cases
                </Link>{" "}
                for updates.
              </p>
            ) : null}
            {payouts.length > 0 ? (
              <p className="mt-2">
                You have {payouts.length} payout
                {payouts.length > 1 ? "s" : ""} pending approval in{" "}
                <Link href="/wallet" className="text-cyan-200">
                  Wallet
                </Link>
                .
              </p>
            ) : null}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-lg font-semibold text-cyan-200">
              Account overview
            </h2>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>
                <span className="text-white/50">Email:</span> {user.email}
              </p>
              <p>
                <span className="text-white/50">Name:</span> {user.name}
              </p>
              <p>
                <span className="text-white/50">Role:</span> {user.role}
              </p>
              <p>
                <span className="text-white/50">KYC status:</span>{" "}
                {user.profile?.kycStatus ?? "PENDING"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-lg font-semibold text-cyan-200">
              Profile snapshot
            </h2>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>
                <span className="text-white/50">Lichess:</span>{" "}
                {user.profile?.lichessUsername ?? "Not linked"}
              </p>
              <p>
                <span className="text-white/50">Country:</span>{" "}
                {user.profile?.country ?? "Not set"}
              </p>
              <p>
                <span className="text-white/50">Bio:</span>{" "}
                {user.profile?.bio ?? "Add a short bio."}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-lg font-semibold text-cyan-200">
              Active tournaments
            </h2>
            {activeEntries.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">
                No active entries yet. Join a tournament to get started.
              </p>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-white/70">
                {activeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        {entry.tournament.status.replace("_", " ")}
                      </p>
                      <p className="text-base font-semibold text-white">
                        {entry.tournament.name}
                      </p>
                      <p className="text-xs text-white/50">
                        Starts {formatDateTime(entry.tournament.startDate)}
                      </p>
                    </div>
                    <Link
                      href={`/tournaments/${entry.tournament.id}`}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:border-cyan-300 hover:text-white"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-lg font-semibold text-cyan-200">
              Latest match
            </h2>
            {lastMatch ? (
              <div className="mt-4 space-y-2 text-sm text-white/70">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {lastMatch.tournament.name}
                </p>
                <p className="text-base font-semibold text-white">
                  Result: {lastMatch.result ?? "Completed"}
                </p>
                <p className="text-xs text-white/50">
                  Completed {formatDateTime(lastMatch.completedAt ?? new Date())}
                </p>
                <Link
                  href={`/tournaments/${lastMatch.tournamentId}`}
                  className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:border-cyan-300 hover:text-white"
                >
                  View tournament
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/60">
                No completed matches yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
