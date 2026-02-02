"use client";

import { useState } from "react";

type AdminAnticheatCaseActionsProps = {
  caseId: string;
  initialNotes: string | null;
};

export default function AdminAnticheatCaseActions({
  caseId,
  initialNotes,
}: AdminAnticheatCaseActionsProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function resolveCase(nextStatus: "RESOLVED" | "DISMISSED") {
    setStatus("saving");
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/anticheat/cases/${caseId}/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus, adminNotes: notes }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not update case");
        setStatus("error");
        return;
      }

      window.location.reload();
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
        placeholder="Admin notes..."
      />
      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => resolveCase("RESOLVED")}
          disabled={status === "saving"}
          className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Resolve
        </button>
        <button
          type="button"
          onClick={() => resolveCase("DISMISSED")}
          disabled={status === "saving"}
          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
