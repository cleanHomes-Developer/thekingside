import Link from "next/link";

export default function AntiCheatPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070b16] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Anti-cheat policy
          </p>
          <h1 className="text-3xl font-semibold">Fair play enforcement</h1>
          <p className="text-white/60">
            We use automated signals and manual review to protect integrity.
          </p>
        </header>

        <section className="space-y-4 text-sm text-white/70">
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Detection layers
            </h2>
            <ul className="mt-3 space-y-2">
              <li>Automated signals monitor suspicious behavior.</li>
              <li>High-risk cases are escalated for manual review.</li>
              <li>All actions are logged for auditability.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Holds and outcomes
            </h2>
            <ul className="mt-3 space-y-2">
              <li>Payouts are held while a case is under review.</li>
              <li>Resolved cases may unlock or deny payouts.</li>
              <li>Repeat offenders may be removed from the platform.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">Appeals</h2>
            <p className="mt-3">
              Players may submit an appeal with supporting evidence. Appeals are
              reviewed by admins and logged.
            </p>
          </div>
        </section>

        <div className="text-sm text-white/60">
          Learn more on the{" "}
          <Link href="/rules" className="text-cyan-300">
            rules
          </Link>{" "}
          page.
        </div>
      </div>
    </div>
  );
}
