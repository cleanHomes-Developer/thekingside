"use client";

import { useState } from "react";
import Link from "next/link";

type AntiCheatReportFormProps = {
  tournamentId: string;
};

export default function AntiCheatReportForm({
  tournamentId,
}: AntiCheatReportFormProps) {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);

  async function submitReport() {
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/anticheat/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          riskLevel: "MEDIUM",
          evidence: {
            source: "player-report",
          },
          description,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not submit report");
        setStatus("error");
        return;
      }

      const data = await response.json().catch(() => null);
      setCaseId(data?.caseId ?? null);
      setStatus("sent");
      setDescription("");
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-white/70">
      <h2 className="text-base font-semibold text-cyan-200">
        Report suspicious play
      </h2>
      <p className="mt-2 text-sm text-white/60">
        Submit a brief description of the behavior. Reports are reviewed by
        admins and can trigger a payout hold.
      </p>
      <textarea
        rows={3}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="mt-4 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
        placeholder="Describe the suspicious behavior..."
      />
      {error ? (
        <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={submitReport}
        disabled={status === "sending" || description.trim().length < 10}
        className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "sending"
          ? "Submitting..."
          : status === "sent"
            ? "Report sent"
            : "Submit report"}
      </button>
      {caseId ? (
        <p className="text-xs text-white/60">
          View case details at{" "}
          <Link className="text-cyan-300" href={`/anticheat/${caseId}`}>
            /anticheat/{caseId}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
