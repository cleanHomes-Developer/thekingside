"use client";

import { useState } from "react";

type EligibleTournament = {
  id: string;
  name: string;
  prizePool: string;
};

type PayoutRequestFormProps = {
  tournaments: EligibleTournament[];
  canRequest: boolean;
  reason: string | null;
};

export default function PayoutRequestForm({
  tournaments,
  canRequest,
  reason,
}: PayoutRequestFormProps) {
  const [tournamentId, setTournamentId] = useState(
    tournaments[0]?.id ?? "",
  );
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function submitRequest() {
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          amount: Number(amount),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not request payout");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
      <h2 className="text-base font-semibold text-cyan-200">Request payout</h2>
      {!canRequest ? (
        <p className="mt-3 text-sm text-white/60">{reason}</p>
      ) : tournaments.length === 0 ? (
        <p className="mt-3 text-sm text-white/60">
          No completed tournaments eligible for payout.
        </p>
      ) : (
        <div className="mt-4 space-y-3 text-sm text-white/70">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">
              Tournament
            </label>
            <select
              value={tournamentId}
              onChange={(event) => setTournamentId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
            >
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name} (Pool {tournament.prizePool})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">
              Amount
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          {error ? (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={submitRequest}
            disabled={status === "sending" || Number(amount) <= 0}
            className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "sending"
              ? "Submitting..."
              : status === "sent"
                ? "Requested"
                : "Submit request"}
          </button>
        </div>
      )}
    </div>
  );
}
