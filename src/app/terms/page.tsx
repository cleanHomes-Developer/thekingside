import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070b16] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Terms
          </p>
          <h1 className="text-3xl font-semibold">Terms of service</h1>
          <p className="text-white/60">
            By using The King Side, you agree to these terms.
          </p>
        </header>

        <section className="space-y-4 text-sm text-white/70">
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Eligibility
            </h2>
            <p className="mt-3">
              You must be at least 18 years old and eligible to participate in
              real-money competitions in your jurisdiction.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Account responsibilities
            </h2>
            <ul className="mt-3 space-y-2">
              <li>Keep your login credentials secure.</li>
              <li>Provide accurate registration and KYC information.</li>
              <li>Use only one account per player.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Prohibited conduct
            </h2>
            <ul className="mt-3 space-y-2">
              <li>Cheating, collusion, or use of external assistance.</li>
              <li>Harassment, abuse, or fraudulent activity.</li>
              <li>Attempting to manipulate payouts or brackets.</li>
            </ul>
          </div>
        </section>

        <div className="text-sm text-white/60">
          See also{" "}
          <Link href="/privacy" className="text-cyan-300">
            privacy policy
          </Link>{" "}
          and{" "}
          <Link href="/anti-cheat-policy" className="text-cyan-300">
            anti-cheat policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
