import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import HealthPanel from "./HealthPanel";

export default async function AdminHealthPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Admin
          </p>
          <h1 className="text-3xl font-semibold">Health monitoring</h1>
          <p className="text-white/60">
            Live checks for infrastructure and critical integrations.
          </p>
          <Link
            href="/admin"
            className="inline-flex text-sm text-cyan-200 hover:text-cyan-100"
          >
            Back to admin
          </Link>
        </header>

        <HealthPanel />
      </div>
    </div>
  );
}
