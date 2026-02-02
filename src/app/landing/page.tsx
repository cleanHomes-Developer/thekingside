import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Only One Can Rule",
  description:
    "The King Side is assembling its founding roster. The arena opens at critical mass.",
  alternates: {
    canonical: "/landing",
  },
  openGraph: {
    title: "Only One Can Rule",
    description:
      "The King Side is assembling its founding roster. The arena opens at critical mass.",
    url: "https://thekingside.com/landing",
    siteName: "The King Side",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Only One Can Rule",
    description:
      "The King Side is assembling its founding roster. The arena opens at critical mass.",
  },
};

const prizeCurrent = 0;
const prizeTarget = 1000;
const prizePct = Math.round((prizeCurrent / prizeTarget) * 100);

const momentumCards = [
  { label: "Founding roster", value: "Open" },
  { label: "Competitors arriving", value: "Daily" },
  { label: "Arena opening", value: "Critical mass" },
];

const steps = [
  { title: "Enter", body: "Enter the founding roster" },
  { title: "Compete", body: "Compete when gates open" },
  { title: "Rule", body: "Rule the season" },
];

const milestones = [
  { key: "100", label: <>100 players &mdash; $50 prize equivalent</> },
  { key: "1000", label: <>1,000 players &mdash; $100 prize equivalent</> },
  { key: "5000", label: <>5,000 players &mdash; $500 prize equivalent</> },
  { key: "10000", label: <>10,000 players &mdash; $1,000 prize equivalent</> },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1">
                Founding era
              </span>
              <span className="text-white/50">Roster assembling</span>
            </div>
            <h1 className="text-4xl font-semibold text-white md:text-6xl">
              Only One Can Rule&trade;
            </h1>
            <p className="text-lg text-white/80 md:text-xl">
              The founding roster is assembling. The arena opens at critical
              mass.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
              >
                Join the founding roster
              </Link>
              <Link
                href="/tournaments"
                className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300 hover:text-white"
              >
                View the league
              </Link>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
              Founding status is earned now.
            </p>
          </div>

          <div className="panel-surface rounded-3xl border px-6 py-6 text-white/80">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                Founding honors
              </p>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                Ceremony
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">
              ${prizeCurrent.toFixed(2)}
              <span className="text-white/40"> / ${prizeTarget.toFixed(2)}</span>
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-200 to-amber-300"
                style={{ width: `${prizePct}%` }}
              />
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/50">
              Founding milestones
            </p>
            <p className="mt-4 text-sm text-white/70">
              As the arena fills, The King Side will honor the moment. At each
              milestone, one founding competitor is chosen.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {momentumCards.map((stat) => (
            <div
              key={stat.label}
              className="panel-surface rounded-2xl border px-5 py-4"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="panel-surface rounded-3xl border px-6 py-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              The Path to the Throne
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Founding flow
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-[rgba(14,22,36,0.6)] px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
                  {step.title}
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="panel-surface rounded-3xl border px-6 py-6">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              Founding Era Rewards
            </p>
            <div className="mt-4 space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.key}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(12,18,30,0.7)] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-white">
                    {milestone.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel-soft rounded-3xl border px-6 py-6 text-white/70">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Identity
            </p>
            <p className="mt-4 text-lg text-white">
              Not Everyone Is Meant to Rule.
            </p>
            <p className="mt-3 text-white/70">
              Serious competitors only. The first names on record set the
              standard.
            </p>
            <p className="mt-3 text-white/70">
              The arena opens when the roster is ready.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300 hover:text-white"
              >
                Secure your seat
              </Link>
              <Link
                href="/play"
                className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
              >
                Enter the lobby
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
