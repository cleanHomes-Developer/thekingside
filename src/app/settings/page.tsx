import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";
import { getCurrentUserWithProfile } from "@/lib/auth/user";
import { getLichessConfig } from "@/lib/lichess/client";

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
