import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { getSeasonConfig } from "@/lib/season";
import AdminSponsorForm from "./AdminSponsorForm";

export default async function AdminSponsorsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const [season, sponsors] = await Promise.all([
    getSeasonConfig(),
    prisma.sponsor.findMany({
      orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);
  const activeCount = sponsors.reduce(
    (count, sponsor) => count + (sponsor.active ? 1 : 0),
    0,
  );

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Admin
            </p>
            <h1 className="text-3xl font-semibold">Sponsorships</h1>
            <p className="text-white/60">
              Manage sponsor slots and placements.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to admin
          </Link>
        </header>

        <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-sm text-white/70">
          <p>
            Sponsorships are{" "}
            <span className="text-white/90">
              {season.sponsorshipEnabled ? "enabled" : "disabled"}
            </span>{" "}
            with {season.sponsorSlots} slots.
          </p>
          <p className="mt-2 text-white/50">
            Active sponsors: {activeCount}/{season.sponsorSlots}
          </p>
        </div>

        <AdminSponsorForm />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-cyan-200">
            Current sponsors
          </h2>
          {sponsors.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-white/70">
              No sponsors yet.
            </div>
          ) : (
            <div className="space-y-3">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-5 text-sm text-white/70"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="h-10 w-10 rounded-full border border-white/10 object-cover"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                        {sponsor.tier}
                      </p>
                      <p className="text-base font-semibold text-white">
                        {sponsor.name}
                      </p>
                      <p className="text-white/50">
                        {sponsor.active ? "Active" : "Inactive"} | Order{" "}
                        {sponsor.sortOrder}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/admin/sponsors/${sponsor.id}`}
                      className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
