import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserWithProfile } from "@/lib/auth/user";

export default async function DashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect("/login");
  }

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
      </div>
    </div>
  );
}
