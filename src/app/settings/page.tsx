import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";
import { getCurrentUserWithProfile } from "@/lib/auth/user";
import { getLichessConfig } from "@/lib/lichess/client";
import VerifyEmailBanner from "./VerifyEmailBanner";

export default async function SettingsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Settings
          </p>
          <h1 className="text-3xl font-semibold">Profile details</h1>
          <p className="text-white/60">
            Keep your identity up to date for tournament eligibility.
          </p>
        </header>

        <VerifyEmailBanner verified={Boolean(user.emailVerifiedAt)} />

        {user.profile?.kycStatus !== "VERIFIED" ? (
          <div className="rounded-2xl border border-amber-300/30 bg-[rgba(24,22,12,0.6)] p-5 text-sm text-amber-100">
            <p className="font-semibold text-white">KYC verification needed</p>
            <p className="mt-2 text-white/70">
              Complete verification to unlock payouts. Admin approval is required
              before any cash rewards are issued.
            </p>
            <Link
              href="/support"
              className="mt-3 inline-flex rounded-full border border-amber-200/40 px-4 py-2 text-xs text-amber-100 hover:border-amber-200/70"
            >
              Start verification
            </Link>
          </div>
        ) : null}

        <SettingsForm
          user={{
            name: user.name,
            displayName: user.displayName,
            profile: user.profile,
          }}
          lichessConfigured={Boolean(getLichessConfig())}
        />
      </div>
    </div>
  );
}
