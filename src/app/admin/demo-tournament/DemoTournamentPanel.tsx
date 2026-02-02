"use client";

import { useState } from "react";

export default function DemoTournamentPanel() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  async function handleSimulate() {
    setStatus("running");
    setMessage(null);
    setTournamentId(null);

    try {
      const response = await fetch("/api/admin/demo-tournament", {
        method: "POST",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(data?.error ?? "Could not run simulation");
        setStatus("error");
        return;
      }
      setTournamentId(data?.tournamentId ?? null);
      setStatus("done");
    } catch (err) {
      setMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-sm text-white/70">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Demo mode
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Simulate a full Swiss tournament
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Creates 16 demo players, generates all rounds, and completes the
          tournament instantly.
        </p>
      </div>

      {message ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {message}
        </p>
      ) : null}

      {tournamentId ? (
        <a
          href={`/tournaments/${tournamentId}`}
          className="text-sm text-cyan-200"
        >
          View demo tournament
        </a>
      ) : null}

      <button
        type="button"
        onClick={handleSimulate}
        disabled={status === "running"}
        className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "running" ? "Simulating..." : "Run demo simulation"}
      </button>
    </div>
  );
}
