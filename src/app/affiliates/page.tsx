import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliates",
  description:
    "Trusted partners and offers selected for competitive chess players.",
  alternates: {
    canonical: "/affiliates",
  },
  openGraph: {
    title: "Affiliates",
    description:
      "Trusted partners and offers selected for competitive chess players.",
    url: "https://thekingside.com/affiliates",
    siteName: "The King Side",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Affiliates",
    description:
      "Trusted partners and offers selected for competitive chess players.",
  },
};
import { prisma } from "@/lib/db";

const categoryLabels: Record<string, string> = {
  HARDWARE: "Gaming Hardware",
  PLATFORMS: "Gaming Platforms & Software",
  STREAMING: "Streaming & Content Creation",
  MARKETPLACES: "Game Keys & Digital Marketplaces",
  GENERAL: "General & High-Commission",
};

export default async function AffiliatesPage() {
  const programs = await prisma.affiliateProgram.findMany({
    where: { enabled: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen bg-[#070b16] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Affiliates
          </p>
          <h1 className="text-3xl font-semibold">Recommended partners</h1>
          <p className="text-white/60">
            We only enable affiliate partners after we have agreements in place.
          </p>
        </header>

        {programs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-white/70">
            No affiliate partners are available yet.
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
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {filtered.map((program) => (
                      <div
                        key={program.id}
                        className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                          {program.commissionRange} | {program.cookieDuration}
                        </p>
                        <p className="mt-2 text-base font-semibold text-white">
                          {program.name}
                        </p>
                        {program.notes ? (
                          <p className="mt-2 text-xs text-white/60">
                            {program.notes}
                          </p>
                        ) : null}
                        <div className="mt-4">
                          <Link
                            href={`/api/affiliates/click/${program.id}`}
                            className="rounded-full border border-cyan-300/40 px-3 py-1 text-xs text-cyan-100"
                          >
                            Visit partner
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
