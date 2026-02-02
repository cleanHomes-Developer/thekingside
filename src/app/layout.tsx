import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getSeasonConfig } from "@/lib/season";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thekingside.com"),
  title: {
    default: "The King Side",
    template: "%s | The King Side",
  },
  description:
    "Competitive chess tournaments with verified outcomes, live brackets, and premium rewards.",
  keywords: [
    "chess tournaments",
    "online chess tournament",
    "competitive chess",
    "chess league",
    "daily chess tournament",
    "prize chess tournament",
    "chess bracket",
    "Swiss chess",
    "chess competitions",
  ],
  openGraph: {
    title: "The King Side",
    description:
      "Competitive chess tournaments with verified outcomes, live brackets, and premium rewards.",
    url: "https://thekingside.com",
    siteName: "The King Side",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The King Side",
    description:
      "Competitive chess tournaments with verified outcomes, live brackets, and premium rewards.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "The King Side",
      url: "https://thekingside.com",
      logo: "https://thekingside.com/favicon.ico",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "The King Side",
      url: "https://thekingside.com",
    },
  ];
  const session = await getSessionFromCookies();
  const [user, season] = await Promise.all([
    session?.sub
      ? prisma.user.findUnique({
          where: { id: session.sub },
        })
      : Promise.resolve(null),
    getSeasonConfig(),
  ]);
  const sponsors = season.sponsorshipEnabled
    ? await (async () => {
        const now = new Date();
        return prisma.sponsor.findMany({
          where: {
            active: true,
            AND: [
              { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
              { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
            ],
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          take: season.sponsorSlots,
          select: {
            id: true,
            name: true,
            tier: true,
            logoUrl: true,
            websiteUrl: true,
          },
        });
      })()
    : [];

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(15,23,42,0.9)] backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm text-white/80">
              <Link href="/" className="text-base font-semibold text-white">
                The King Side
              </Link>
              <span className="hidden text-[10px] uppercase tracking-[0.35em] text-amber-200/80 md:inline">
                Only One Can Rule.™
              </span>
              <nav className="flex flex-wrap items-center gap-3">
                <Link
                  href="/tournaments"
                  className="rounded-full border border-white/10 px-3 py-1 transition hover:border-cyan-300 hover:text-white"
                >
                  Tournaments
                </Link>
                <Link
                  href="/play"
                  className="rounded-full border border-white/10 px-3 py-1 transition hover:border-cyan-300 hover:text-white"
                >
                  Play
                </Link>
                <Link
                  href="/demo"
                  className="rounded-full border border-white/10 px-3 py-1 transition hover:border-cyan-300 hover:text-white"
                >
                  Demo
                </Link>
                <Link
                  href="/affiliates"
                  className="rounded-full border border-white/10 px-3 py-1 transition hover:border-cyan-300 hover:text-white"
                >
                  Affiliates
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="rounded-full border border-white/10 px-3 py-1 transition hover:border-cyan-300 hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/wallet"
                      className="rounded-full border border-white/10 px-3 py-1 transition hover:border-cyan-300 hover:text-white"
                    >
                      Wallet
                    </Link>
                    <Link
                      href="/support"
                      className="rounded-full border border-white/10 px-3 py-1 transition hover:border-cyan-300 hover:text-white"
                    >
                      Support
                    </Link>
                    <Link
                      href="/anticheat"
                      className="rounded-full border border-white/10 px-3 py-1 transition hover:border-cyan-300 hover:text-white"
                    >
                      My cases
                    </Link>
                    {user.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        className="rounded-full border border-cyan-400/40 px-3 py-1 text-cyan-200 transition hover:border-cyan-300"
                      >
                        Admin
                      </Link>
                    ) : null}
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-full border border-white/10 px-3 py-1 transition hover:border-cyan-300 hover:text-white"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-full bg-cyan-400 px-3 py-1 font-semibold text-slate-900 transition hover:bg-cyan-300"
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-white/10 bg-[rgba(10,16,28,0.9)] py-10 text-sm text-white/70">
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 md:grid-cols-[1.2fr_1fr_1fr]">
              <div className="space-y-2">
                <p className="text-xs text-white/50">
                  © 2026 The King Side™. All rights reserved.
                </p>
                <p className="text-[10px] text-white/40">
                  The King Side™ is a trademark of The King Side. All other
                  trademarks belong to their respective owners.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Explore
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/tournaments" className="hover:text-cyan-200">
                    Tournaments
                  </Link>
                  <Link href="/leaderboard" className="hover:text-cyan-200">
                    Leaderboard
                  </Link>
                  <Link href="/affiliates" className="hover:text-cyan-200">
                    Affiliates
                  </Link>
                  <Link href="/faq" className="hover:text-cyan-200">
                    FAQ
                  </Link>
                  <Link href="/support" className="hover:text-cyan-200">
                    Support
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Policies
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/rules" className="hover:text-cyan-200">
                    Rules
                  </Link>
                  <Link href="/prize-policy" className="hover:text-cyan-200">
                    Prize policy
                  </Link>
                  <Link href="/refund-policy" className="hover:text-cyan-200">
                    Refund policy
                  </Link>
                  <Link href="/anti-cheat-policy" className="hover:text-cyan-200">
                    Anti-cheat policy
                  </Link>
                  <Link href="/terms" className="hover:text-cyan-200">
                    Terms
                  </Link>
                  <Link href="/privacy" className="hover:text-cyan-200">
                    Privacy
                  </Link>
                </div>
              </div>
            </div>
            {sponsors.length ? (
              <div className="mx-auto mt-10 w-full max-w-6xl px-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Sponsors
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {sponsors.map((sponsor) => {
                    const content = (
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="h-8 w-8 rounded-full border border-white/10 object-cover"
                      />
                    );
                    const details = (
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                          {sponsor.tier}
                        </p>
                        <p className="text-sm text-white/80">
                          {sponsor.name}
                        </p>
                      </div>
                    );

                    const containerClass =
                      "flex items-center gap-3 rounded-xl border border-white/10 bg-[rgba(26,32,44,0.6)] px-4 py-2 text-xs text-white/70 transition hover:border-cyan-300/60";

                    if (sponsor.websiteUrl) {
                      return (
                        <a
                          key={sponsor.id}
                          href={sponsor.websiteUrl}
                          className={containerClass}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {content}
                          {details}
                        </a>
                      );
                    }

                    return (
                      <div key={sponsor.id} className={containerClass}>
                        {content}
                        {details}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </footer>
        </div>
      </body>
    </html>
  );
}

