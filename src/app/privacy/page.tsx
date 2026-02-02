import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070b16] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Privacy
          </p>
          <h1 className="text-3xl font-semibold">Privacy policy</h1>
          <p className="text-white/60">
            We respect your privacy and protect your data.
          </p>
        </header>

        <section className="space-y-4 text-sm text-white/70">
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Data we collect
            </h2>
            <ul className="mt-3 space-y-2">
              <li>Account information and profile data.</li>
              <li>Tournament participation and match results.</li>
              <li>Compliance data required for payouts.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              How we use data
            </h2>
            <ul className="mt-3 space-y-2">
              <li>To run tournaments and process payouts.</li>
              <li>To enforce fair play and platform security.</li>
              <li>To communicate important updates.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Data security
            </h2>
            <p className="mt-3">
              We use encryption, access controls, and audit logs to protect
              sensitive data.
            </p>
          </div>
        </section>

        <div className="text-sm text-white/60">
          For inquiries, visit{" "}
          <Link href="/support" className="text-cyan-300">
            Support
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
