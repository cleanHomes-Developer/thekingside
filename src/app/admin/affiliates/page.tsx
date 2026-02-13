import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import AffiliateSeedButton from "./AffiliateSeedButton";

const categoryLabels: Record<string, string> = {
  HARDWARE: "Gaming Hardware",
  PLATFORMS: "Gaming Platforms & Software",
  STREAMING: "Streaming & Content Creation",
  MARKETPLACES: "Game Keys & Marketplaces",
  GENERAL: "General & High-Commission",
};

export default async function AdminAffiliatesPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const programs = await prisma.affiliateProgram.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Admin
            </p>
            <h1 className="text-3xl font-semibold">Affiliate programs</h1>
            <p className="text-white/60">
              Enable programs as contracts are signed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
            >
              Back to admin
            </Link>
          </div>
        </header>

        <AffiliateSeedButton />

        {programs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-white/70">
            No affiliate programs yet. Seed the list to get started.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(categoryLabels).map(([category, label]) => {
              const filtered = programs.filter(
                (program) => program.category === category,
              );
              if (filtered.length === 0) {
                return null;
              }
              return (
                <section
                  key={category}
                  className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6"
                >
                  <h2 className="text-lg font-semibold text-cyan-200">
                    {label}
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-white/70">
                    {filtered.map((program) => (
                      <div
                        key={program.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                            {program.commissionRange} | {program.cookieDuration}
                          </p>
                          <p className="text-base font-semibold text-white">
                            {program.name}
                          </p>
                          <p className="text-xs text-white/50">
                            {program.enabled ? "Enabled" : "Disabled"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/affiliates/${program.id}`}
                            className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
