import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import AnnouncementsPanel from "./AnnouncementsPanel";

export default async function AdminAnnouncementsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Admin
          </p>
          <h1 className="text-3xl font-semibold">Announcements</h1>
          <p className="text-white/60">
            Broadcast updates, milestone alerts, and winner notices.
          </p>
          <Link
            href="/admin"
            className="inline-flex text-sm text-cyan-200 hover:text-cyan-100"
          >
            Back to admin
          </Link>
        </header>

        <AnnouncementsPanel />
      </div>
    </div>
  );
}
