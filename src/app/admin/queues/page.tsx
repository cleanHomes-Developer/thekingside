import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { hasQueueConnection } from "@/lib/queues";
import QueuesPanel from "./QueuesPanel";

export default async function AdminQueuesPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const connected = hasQueueConnection();

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Admin
          </p>
          <h1 className="text-3xl font-semibold">BullMQ dashboard</h1>
          <p className="text-white/60">
            Queue health, backlog, and processing status.
          </p>
          <Link
            href="/admin"
            className="inline-flex text-sm text-cyan-200 hover:text-cyan-100"
          >
            Back to admin
          </Link>
        </header>

        {!connected ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-sm text-amber-200">
            Redis is not configured. Set REDIS_URL to enable queue monitoring.
          </div>
        ) : (
          <QueuesPanel />
        )}
      </div>
    </div>
  );
}
