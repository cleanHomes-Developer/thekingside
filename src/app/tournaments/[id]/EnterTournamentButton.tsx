"use client";

import { useState } from "react";

type EnterTournamentButtonProps = {
  tournamentId: string;
  isFreeSeason: boolean;
};

export default function EnterTournamentButton({
  tournamentId,
  isFreeSeason,
}: EnterTournamentButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "entered" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);

  async function handleEnter() {
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(data?.error ?? "Could not enter tournament");
        setStatus("error");
        return;
      }

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data?.waitlistPosition) {
        setWaitlistPosition(Number(data.waitlistPosition));
        setStatus("entered");
        setMessage(`Added to waitlist. Position ${data.waitlistPosition}.`);
        return;
      }

      setStatus("entered");
    } catch (err) {
      setMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleEnter}
        disabled={status === "loading" || status === "entered"}
        className="rounded-full bg-cyan-400 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading"
          ? "Entering..."
          : status === "entered"
            ? waitlistPosition
              ? "Waitlisted"
              : "Entered"
            : isFreeSeason
              ? "Enter free tournament"
              : "Enter tournament"}
      </button>
      {message ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {message}
        </p>
      ) : null}
    </div>
  );
}
