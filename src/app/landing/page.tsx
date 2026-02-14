import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export const metadata: Metadata = {
  title: "Only One Can Rule",
  description:
    "The King Side is a competitive chess tournament league with Swiss pairings and verified rewards.",
  keywords: [
    "chess tournaments",
    "online chess tournament",
    "competitive chess",
    "Swiss chess tournament",
    "chess league",
    "prize chess",
    "daily chess tournament",
    "chess competition",
  ],
  alternates: {
    canonical: "/landing",
  },
  openGraph: {
    title: "Only One Can Rule",
    description:
      "The King Side is a competitive chess tournament league with Swiss pairings and verified rewards.",
    url: "https://thekingside.com/landing",
    siteName: "The King Side",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://thekingside.com/og/landing.svg",
        width: 1200,
        height: 630,
        alt: "The King Side chess tournaments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Only One Can Rule",
    description:
      "The King Side is a competitive chess tournament league with Swiss pairings and verified rewards.",
    images: ["https://thekingside.com/og/landing.svg"],
  },
};

const milestones = [
  { key: "100", label: <>100 players - $50 prize equivalent</> },
  { key: "1000", label: <>1,000 players - $100 prize equivalent</> },
  { key: "5000", label: <>5,000 players - $500 prize equivalent</> },
  { key: "10000", label: <>10,000 players - $1,000 prize equivalent</> },
];

const faqs = [
  {
    question: "What is The King Side?",
    answer:
      "The King Side is a competitive chess tournament league with Swiss pairings and verified rewards.",
  },
  {
    question: "How do Swiss pairings work?",
    answer:
      "Swiss rounds match you with opponents near your score each round to keep competition balanced.",
  },
  {
    question: "What time controls are used?",
    answer:
      "Events use clear clock formats such as 5+5 or 3+2, announced per tournament.",
  },
  {
    question: "How are rewards verified?",
    answer:
      "Results and payouts are verified with integrity checks, including KYC gating and anti-cheat holds.",
  },
];

export default async function LandingPage() {
  let playerCount = 0;
  try {
    playerCount = await prisma.user.count();
  } catch {
    playerCount = 0;
  }
  const nextTarget = 100;
  const prizeTarget = 1000;
  const prizeCurrent = Math.min(playerCount, prizeTarget);
  const prizePct = Math.round((prizeCurrent / prizeTarget) * 100);
  const seed = crypto
    .createHash("sha256")
    .update(`${playerCount}|${new Date().toISOString().slice(0, 10)}`)
    .digest("hex")
    .slice(0, 12);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "The King Side - Only One Can Rule",
    description:
      "The King Side is a competitive chess tournament league with Swiss pairings and verified rewards.",
    inLanguage: "en-US",
    about: [
      "Chess tournament",
      "Swiss-system tournament",
      "Competitive chess league",
    ],
    url: "https://thekingside.com/landing",
  };
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[520px] w-[520px] rounded-full bg-cyan-400/12 blur-[140px]" />
        <div className="absolute right-[-140px] top-24 h-[580px] w-[580px] rounded-full bg-amber-300/12 blur-[160px]" />
        <div className="absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] opacity-15" />
      </div>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24 pt-24">
        <div className="space-y-10">
          <nav className="sr-only" aria-label="Landing page anchors">
            <Link href="#tournament-format">Tournament format</Link>
            <Link href="#swiss-format">Swiss format</Link>
            <Link href="#time-controls">Time controls</Link>
          </nav>
          <span id="tournament-format" className="sr-only">
            Tournament format
          </span>
          <span id="swiss-format" className="sr-only">
            Swiss format
          </span>
          <span id="time-controls" className="sr-only">
            Time controls
          </span>

          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-white md:text-6xl">
              Only One Can Rule&trade;
            </h1>
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">
              A competitive chess tournament league
            </p>
            <p className="text-base text-white/75">
              The King Side is a scheduled Swiss chess tournament league with
              verified rewards.
            </p>
            <p className="text-lg text-white/85 md:text-xl">
              Swiss pairings. Scheduled rounds. Verified rewards.
            </p>
            <p className="text-base text-white/70">
              The founding roster is assembling. The arena opens at critical
              mass.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-cyan-400 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Join the founding roster
            </Link>
            <Link
              href="/tournaments"
              className="rounded-full border border-white/25 px-6 py-2 text-sm font-semibold text-white/85 transition hover:border-cyan-300 hover:text-white"
            >
              View the league
            </Link>
          </div>

          <p className="text-sm text-white/70">
            Built for serious competitors. Not casual play.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="space-y-5 text-white/80">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              Founding honors
            </p>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
              Ceremony
            </span>
          </div>
          <p className="text-4xl font-semibold text-white">
            ${prizeCurrent.toFixed(2)}
            <span className="text-white/40"> / ${prizeTarget.toFixed(2)}</span>
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            {playerCount} / {nextTarget} to next milestone
          </p>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-200 to-amber-300"
              style={{ width: `${prizePct}%` }}
            />
          </div>
          <p className="text-sm text-white/70">
            As the arena fills, one founding competitor is chosen.
          </p>
          <details className="text-xs text-white/60">
            <summary className="cursor-pointer uppercase tracking-[0.3em] text-white/50">
              View milestones
            </summary>
            <div className="mt-3 space-y-2">
              {milestones.map((milestone) => (
                <div key={milestone.key} className="flex items-center justify-between">
                  <span className="text-white/70">{milestone.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/80">
                    Founding
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-white/40">
              Selection seed hash: {seed}
            </p>
          </details>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-[#0b1426]/70 p-8">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              FAQ
            </p>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              Tournament basics
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <p className="text-sm font-semibold text-white">{faq.question}</p>
                <p className="mt-2 text-sm text-white/65">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-28">
        <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(10,16,28,0.95),rgba(12,22,40,0.9))] px-6 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
            The arena is forming
          </p>
          <p className="mt-4 text-3xl font-semibold text-white">
            Take your seat before the gates open.
          </p>
          <p className="mt-3 text-sm text-white/70">
            Founding competitors are recorded. The roster decides when the
            league begins.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-full bg-cyan-400 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              Join now
            </Link>
            <Link
              href="/tournaments"
              className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white/85 transition hover:border-cyan-300 hover:text-white"
            >
              See the format
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
