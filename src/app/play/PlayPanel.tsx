"use client";

import { useState } from "react";
import UnifiedBoard from "./UnifiedBoard";

type Mode = "player" | "bot";

const modeCopy: Record<Mode, { title: string; subtitle: string }> = {
  player: {
    title: "Player match",
    subtitle: "Queue up for live opponents with real-time ratings.",
  },
  bot: {
    title: "Bot match",
    subtitle: "Play Stockfish-powered practice games with full controls.",
  },
};

export default function PlayPanel() {
  const [mode, setMode] = useState<Mode>("player");

  return (
    <div className="rounded-[32px] border border-cyan-400/20 bg-[#0c1527] p-8 shadow-[0_0_45px_rgba(0,217,255,0.2)]">
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
      <div className="mt-8">
        <div key={mode} className="animate-fade-in">
          <UnifiedBoard mode={mode} />
        </div>
      </div>
    </div>
  );
}
