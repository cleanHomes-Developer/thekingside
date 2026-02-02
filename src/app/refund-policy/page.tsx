import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070b16] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Refund policy
          </p>
          <h1 className="text-3xl font-semibold">Refunds and cancellations</h1>
          <p className="text-white/60">
            When refunds are available and how they are processed.
          </p>
        </header>

        <section className="space-y-4 text-sm text-white/70">
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Before lock
            </h2>
            <p className="mt-3">
              Refunds are available before tournament lock. The lock time is 2
              minutes before the scheduled start.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              After lock
            </h2>
            <p className="mt-3">
              Refunds are not issued after lock unless the tournament is
              cancelled due to system error or minimum player rules.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Tournament cancellation
            </h2>
            <p className="mt-3">
              If minimum players are not met at lock, the tournament is
              cancelled and all paid entries are refunded automatically.
            </p>
          </div>
        </section>

        <div className="text-sm text-white/60">
          For payout timing, see{" "}
          <Link href="/prize-policy" className="text-cyan-300">
            prize policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
