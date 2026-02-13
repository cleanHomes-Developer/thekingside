"use client";

import { useEffect, useMemo, useState } from "react";
import UnifiedBoard from "../UnifiedBoard";

type Mode = "player" | "bot";

type MasterySkill = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  maxLevel: number;
  xp: number;
  level: number;
  progress: number;
  needed: number;
};

type MasteryCategory = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  skills: MasterySkill[];
};

type MasteryOverview = {
  player: {
    id: string;
    displayName: string;
    rating: number | null;
  };
  categories: MasteryCategory[];
  feedback: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null;
};

const modeCopy: Record<Mode, { title: string; subtitle: string }> = {
  player: {
    title: "Mastery Match",
    subtitle: "Hidden rating matchmaking with skill-based progress.",
  },
  bot: {
    title: "Mastery Practice",
    subtitle: "Train with the bot and grow your skill tree.",
  },
};

function SkillBar({ skill }: { skill: MasterySkill }) {
  const percent =
    skill.needed > 0 ? Math.min(100, (skill.progress / skill.needed) * 100) : 0;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1426] p-3">
      <div className="flex items-center justify-between text-xs text-white/70">
        <span className="font-semibold text-white">{skill.name}</span>
        <span className="text-cyan-200">Lv {skill.level}</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-950/50">
        <div
          className="h-2 rounded-full bg-cyan-400"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-white/50">
        {skill.description ?? "Skill mastery in progress."}
      </p>
    </div>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function averageLevel(skills: MasterySkill[]) {
  if (skills.length === 0) {
    return 0;
  }
  const total = skills.reduce((acc, skill) => acc + skill.level, 0);
  return total / skills.length;
}

function overallLevel(categories: MasteryCategory[]) {
  const all = categories.flatMap((category) => category.skills);
  return averageLevel(all);
}

function sortByStrength(skills: MasterySkill[], direction: "high" | "low") {
  return [...skills].sort((a, b) => {
    if (a.level !== b.level) {
      return direction === "high" ? b.level - a.level : a.level - b.level;
    }
    const aProgress = a.needed ? a.progress / a.needed : 0;
    const bProgress = b.needed ? b.progress / b.needed : 0;
    return direction === "high" ? bProgress - aProgress : aProgress - bProgress;
  });
}

function RadarChart({ categories }: { categories: MasteryCategory[] }) {
  const radius = 80;
  const center = 90;
  const angles = categories.map((_, index) => (index / categories.length) * Math.PI * 2);
  const points = categories.map((category, index) => {
    const value = Math.min(10, averageLevel(category.skills));
    const scale = value / 10;
    const angle = angles[index];
    const x = center + Math.cos(angle) * radius * scale;
    const y = center + Math.sin(angle) * radius * scale;
    return `${x},${y}`;
  });
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" />
      <polygon
        points={points.join(" ")}
        fill="rgba(34, 197, 94, 0.25)"
        stroke="rgba(34, 197, 94, 0.8)"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function MasteryPlayPanel() {
  const [mode, setMode] = useState<Mode>("player");
  const [overview, setOverview] = useState<MasteryOverview | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("tks-show-rating");
    if (stored === "true") {
      setShowRating(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tks-show-rating", showRating ? "true" : "false");
  }, [showRating]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const res = await fetch(
        `/api/mastery/overview${showRating ? "?includeRating=1" : ""}`,
      );
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as MasteryOverview;
      if (active) {
        setOverview(data);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [showRating]);

  const summary = useMemo(() => {
    if (!overview?.feedback) {
      return null;
    }
    return overview.feedback.summary;
  }, [overview]);

  const categories = overview?.categories ?? [];
  const allSkills = categories.flatMap((category) => category.skills);
  const strongest = sortByStrength(allSkills, "high").slice(0, 3);
  const weakest = sortByStrength(allSkills, "low").slice(0, 3);
  const overall = overallLevel(categories);
  const pillarOpening = categories.find((category) => category.key === "opening");
  const pillarTactics = categories.find((category) => category.key === "tactics");
  const pillarEndgame = categories.find((category) => category.key === "endgame");
  const midgameBlend = categories.filter((category) =>
    ["positional", "strategy", "practical"].includes(category.key),
  );
  const midgameLevel = overallLevel(midgameBlend);
  const primaryStrength = strongest[0];
  const primaryFocus = weakest[0];
  const scrollToTraining = () => {
    const node = document.getElementById("mastery-training");
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="rounded-[32px] border border-cyan-400/20 bg-[#0c1527] p-10 shadow-[0_0_45px_rgba(0,217,255,0.2)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
            {modeCopy[mode].title}
          </p>
          <p className="text-sm text-white/60">{modeCopy[mode].subtitle}</p>
        </div>
        <div className="flex gap-3">
          {(["player", "bot"] as Mode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`flex min-w-[140px] items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                mode === item
                  ? "border-cyan-400 bg-cyan-400 text-slate-900"
                  : "border-white/20 bg-white/5 text-white/80"
              }`}
            >
              {item === "player" ? "Player" : "Bot"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b1426] p-4 text-sm text-white/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              Mastery insight
            </p>
            <p className="text-white">
              {summary ??
                "Every game builds your mastery tree. Your rating stays hidden, your growth stays visible."}
            </p>
          </div>
          {overview?.player ? (
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-white/60">
              <span>{overview.player.displayName}</span>
              <button
                type="button"
                onClick={() => setShowRating((prev) => !prev)}
                className="rounded-full border border-cyan-300/30 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100"
              >
                {showRating
                  ? overview.player.rating !== null
                    ? `Rating ${overview.player.rating}`
                    : "Loading rating"
                  : "Reveal rating"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        <UnifiedBoard
          mode={mode}
          variant="mastery"
          minBoardWidth={900}
          maxBoardWidth={1800}
        />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-[#0b1426] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
            Mastery snapshot
          </p>
          <p className="mt-2 text-sm text-white/60">
            One strength, one focus, one next step. Everything else is tucked
            away until you want it.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Strength
              </p>
              <p className="mt-2 text-lg font-semibold text-cyan-200">
                {primaryStrength?.name ?? "Keep playing to reveal strengths"}
              </p>
              {primaryStrength ? (
                <p className="text-xs text-white/50">
                  Level {primaryStrength.level}
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Focus next
              </p>
              <p className="mt-2 text-lg font-semibold text-orange-200">
                {primaryFocus?.name ?? "Finish a match to unlock focus"}
              </p>
              {primaryFocus ? (
                <p className="text-xs text-white/50">
                  Level {primaryFocus.level}
                </p>
              ) : null}
              {primaryFocus ? (
                <p className="mt-2 text-xs text-white/60">
                  Recommended drill: {primaryFocus.name} fundamentals
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={scrollToTraining}
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Start a quick drill
            </button>
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80"
            >
              {showDetails ? "Hide full progress" : "See full progress"}
            </button>
          </div>

          {showDetails ? (
            <div className="mt-6 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                Full mastery tree
              </p>
              <div className="space-y-4">
                {categories.length ? (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                    >
                      <p className="text-sm font-semibold text-white">
                        {category.name}
                      </p>
                      {category.description ? (
                        <p className="text-xs text-white/50">
                          {category.description}
                        </p>
                      ) : null}
                      <div className="mt-3 grid gap-3">
                        {category.skills.map((skill) => (
                          <SkillBar key={skill.id} skill={skill} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/50">
                    Loading mastery tree...
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div
          id="mastery-training"
          className="rounded-2xl border border-white/10 bg-[#0b1426] p-6"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
            Next training
          </p>
          <p className="mt-2 text-sm text-white/60">
            These are the skills that will pay off fastest right now.
          </p>
          <div className="mt-4 space-y-3">
            {overview?.feedback?.recommendations?.length ? (
              overview.feedback.recommendations.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/80"
                >
                  {item}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                Finish a match to unlock personalized training guidance.
              </div>
            )}
          </div>
          {overview?.feedback?.strengths?.length ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Strengths
              </p>
              <ul className="mt-2 space-y-1">
                {overview.feedback.strengths.map((item) => (
                  <li key={item} className="text-sm text-cyan-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {overview?.feedback?.weaknesses?.length ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Focus
              </p>
              <ul className="mt-2 space-y-1">
                {overview.feedback.weaknesses.map((item) => (
                  <li key={item} className="text-sm text-orange-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
