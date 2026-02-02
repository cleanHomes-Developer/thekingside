import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Competitive Chess Tournaments",
  description:
    "The King Side runs elite chess tournaments with live brackets, verified outcomes, and transparent prize pools.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Competitive Chess Tournaments",
    description:
      "The King Side runs elite chess tournaments with live brackets, verified outcomes, and transparent prize pools.",
    url: "https://thekingside.com",
    siteName: "The King Side",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Competitive Chess Tournaments",
    description:
      "The King Side runs elite chess tournaments with live brackets, verified outcomes, and transparent prize pools.",
  },
};

const prizeCurrent = 25;
const prizeTarget = 100;
const prizePct = Math.round((prizeCurrent / prizeTarget) * 100);

const timeline = [
  { label: "Days 1-24", title: "Qualifiers", note: "Online Swiss matches" },
  { label: "Days 25-27", title: "Semis", note: "Group stage" },
  { label: "Day 28", title: "Wildcards", note: "Last chance" },
  { label: "Day 30", title: "Final", note: "Championship" },
];

const statCards = [
  { label: "Players registered", value: "287" },
  { label: "Unique players", value: "156" },
  { label: "Days completed", value: "17/30" },
];

const ticketHolders = [
  { name: "Magnus Carlsen", rating: "2847" },
  { name: "Alireza Firouzja", rating: "2765" },
  { name: "Fabiano Caruana", rating: "2804" },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1">
                Grandmaster Sprint
              </span>
              <span className="text-white/50">Free season live</span>
            </div>
            <h1 className="text-4xl font-semibold text-white md:text-6xl">
              Take the King Side.
            </h1>
            <p className="text-lg text-white/80 md:text-xl">
              Welcome to The King Side&trade; - scheduled competitive chess
              tournaments built for real pressure, real winners, and real
              rewards.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
              >
                Join today
              </Link>
              <Link
                href="/tournaments"
                className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300 hover:text-white"
              >
                View tournaments
              </Link>
            </div>
          </div>

          <div className="panel-surface rounded-3xl border px-6 py-6 text-white/80">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                Prize pool tracker
              </p>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                Free season
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
              {prizePct}% filled
            </p>
            <p className="mt-4 text-sm text-white/70">
              Season funding grows with participation and promotions.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
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
              Season timeline
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              30-day season
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {timeline.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-[rgba(14,22,36,0.6)] px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
                  {step.label}
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-white/60">{step.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="panel-surface rounded-3xl border px-6 py-6">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              Golden ticket holders
            </p>
            <div className="mt-4 space-y-3">
              {ticketHolders.map((player) => (
                <div
                  key={player.name}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(12,18,30,0.7)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {player.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      Rating {player.rating}
                    </p>
                  </div>
                  <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                    Seat secured
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel-soft rounded-3xl border px-6 py-6 text-white/70">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Only one can rule
            </p>
            <p className="mt-4 text-lg text-white">
              Competitive brackets, verified outcomes, and strict integrity
              checks.
            </p>
            <p className="mt-3 text-white/70">
              Built for players who want transparent prize pools.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/play"
                className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300 hover:text-white"
              >
                Play while you wait
              </Link>
              <Link
                href="/tournaments"
                className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
              >
                Enter a tournament
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
