import Link from "next/link";

export default function PrizePolicyPage() {
  return (
    <div className="min-h-screen bg-[#070b16] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Prize policy
          </p>
          <h1 className="text-3xl font-semibold">Prize distribution</h1>
          <p className="text-white/60">
            How prize pools are funded, calculated, and paid out.
          </p>
        </header>

        <section className="space-y-4 text-sm text-white/70">
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Pool funding
            </h2>
            <ul className="mt-3 space-y-2">
              <li>75% of entry fees fund the prize pool.</li>
              <li>25% funds platform operations and fees.</li>
              <li>Free seasons use platform-seeded prize pools.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Payout timing
            </h2>
            <ul className="mt-3 space-y-2">
              <li>Payouts are queued after tournament completion.</li>
              <li>KYC verification and anti-cheat checks are required.</li>
              <li>Admin review may be required for flagged cases.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Prize modes
            </h2>
            <p className="mt-3">
              Prize delivery may be cash or gift cards based on the current
              season settings. Gift card rewards are issued directly to the
              account email after verification.
            </p>
          </div>
        </section>

        <div className="text-sm text-white/60">
          Review{" "}
          <Link href="/refund-policy" className="text-cyan-300">
            refund policy
          </Link>{" "}
          for refund scenarios.
        </div>
      </div>
    </div>
  );
}
