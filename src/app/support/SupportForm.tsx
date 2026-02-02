"use client";

import { useState } from "react";

type TournamentOption = {
  id: string;
  name: string;
};

type SupportFormProps = {
  tournaments: TournamentOption[];
};

export default function SupportForm({ tournaments }: SupportFormProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function submitTicket() {
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/support/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          description,
          tournamentId: tournamentId || null,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Could not submit ticket");
        setStatus("error");
        return;
      }
      setSubject("");
      setDescription("");
      setTournamentId("");
      setStatus("sent");
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
      <h2 className="text-base font-semibold text-cyan-200">New ticket</h2>
      <div className="mt-4 space-y-3 text-sm text-white/70">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/50">
            Subject
          </label>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/50">
            Tournament (optional)
          </label>
          <select
            value={tournamentId}
            onChange={(event) => setTournamentId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
          >
            <option value="">None</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/50">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        {error ? (
          <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={submitTicket}
          disabled={
            status === "sending" ||
            subject.trim().length === 0 ||
            description.trim().length === 0
          }
          className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "sending"
            ? "Submitting..."
            : status === "sent"
              ? "Submitted"
              : "Submit ticket"}
        </button>
      </div>
    </div>
  );
}
