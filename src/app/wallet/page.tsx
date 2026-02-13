import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canRequestPayout, hasAntiCheatHold } from "@/lib/payments/payouts";
import { formatCurrency } from "@/lib/format";
import { getSeasonConfig } from "@/lib/season";
import PayoutRequestForm from "./PayoutRequestForm";
import ConnectStripeButton from "./ConnectStripeButton";

export default async function WalletPage() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const [profile, season] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: user.id },
    }),
    getSeasonConfig(),
  ]);

  const entries = await prisma.entry.findMany({
    where: { userId: user.id },
    include: { tournament: true },
  });

  const eligibleTournaments = entries
    .filter((entry) => entry.tournament.status === "COMPLETED")
    .map((entry) => ({
      id: entry.tournament.id,
      name: entry.tournament.name,
      prizePool: formatCurrency(entry.tournament.prizePool.toString()),
    }));

  const cases = await prisma.antiCheatCase.findMany({
    where: { userId: user.id },
  });
  const hold = hasAntiCheatHold(cases);
  const canRequest =
    profile?.kycStatus && canRequestPayout(profile.kycStatus, hold);
  const reason = !profile
    ? "Profile missing."
    : profile.kycStatus !== "VERIFIED"
      ? "Complete KYC verification to request a payout."
      : hold
        ? "An anti-cheat case is holding payouts."
        : null;

  const payouts = await prisma.payout.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { tournament: true },
  });
  const totalPaid = payouts
    .filter((payout) => payout.status === "COMPLETED")
    .reduce((sum, payout) => sum + Number(payout.amount), 0);
  const totalPending = payouts
    .filter((payout) => payout.status === "PENDING")
    .reduce((sum, payout) => sum + Number(payout.amount), 0);

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Wallet
            </p>
            <h1 className="text-3xl font-semibold">Payouts and earnings</h1>
            <p className="text-white/60">
              Track prize money and connect your payout account.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to dashboard
          </Link>
        </header>

        {season.prizeMode === "gift_card" ? (
          <div className="rounded-2xl border border-amber-400/30 bg-[rgba(24,22,12,0.6)] p-6 text-sm text-amber-100">
            Gift card prizes are enabled for this season. Winners will receive
            their reward via email after verification.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <ConnectStripeButton
              connected={profile?.stripeConnectStatus === "VERIFIED"}
            />
            <PayoutRequestForm
              tournaments={eligibleTournaments}
              canRequest={Boolean(canRequest)}
              reason={reason}
            />
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Total paid
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(totalPaid.toFixed(2))}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Pending payouts
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(totalPending.toFixed(2))}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Eligible tournaments
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {eligibleTournaments.length}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
          <h2 className="text-base font-semibold text-cyan-200">
            Payout history
          </h2>
          <div className="mt-3">
            <a
              href="/api/wallet/export"
              className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:border-cyan-300 hover:text-white"
            >
              Download CSV
            </a>
          </div>
          {payouts.length === 0 ? (
            <p className="mt-3 text-sm text-white/60">No payouts yet.</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-white/70">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      {payout.status}
                    </p>
                    <p className="text-base font-semibold text-white">
                      {payout.tournament.name}
                    </p>
                  </div>
                  <div className="text-sm text-white/70">
                    {formatCurrency(payout.amount.toString())}
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
