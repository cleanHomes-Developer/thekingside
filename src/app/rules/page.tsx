import Link from "next/link";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-[#070b16] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Rules
          </p>
          <h1 className="text-3xl font-semibold">Tournament rules</h1>
          <p className="text-white/60">
            These rules apply to all tournaments unless a specific event
            overrides them.
          </p>
        </header>

        <section className="space-y-4 text-sm text-white/70">
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Registration and lock
            </h2>
            <ul className="mt-3 space-y-2">
              <li>Registration closes 2 minutes before start time.</li>
              <li>Entries after lock are not accepted.</li>
              <li>Minimum players must be met at lock or the event cancels.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Format and results
            </h2>
            <ul className="mt-3 space-y-2">
              <li>Swiss format: rounds = ceil(log2(N)) + 1.</li>
              <li>Wins = 1 point, draws = 0.5, losses = 0.</li>
              <li>BYE rounds award 1 point.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Tie-breaks
            </h2>
            <ul className="mt-3 space-y-2">
              <li>Buchholz (opponents' points).</li>
              <li>Sonneborn-Berger (opponents weighted by results).</li>
              <li>Then total wins, then least losses.</li>
            </ul>
          </div>
        </section>

        <div className="text-sm text-white/60">
          For questions, visit{" "}
          <Link href="/faq" className="text-cyan-300">
            FAQ
          </Link>{" "}
          or{" "}
          <Link href="/support" className="text-cyan-300">
            Support
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
