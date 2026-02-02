"use client";

import { useState } from "react";

type AdminSupportDetailActionsProps = {
  ticketId: string;
  initialStatus: string;
  initialNotes: string | null;
};

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export default function AdminSupportDetailActions({
  ticketId,
  initialStatus,
  initialNotes,
}: AdminSupportDetailActionsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setState("saving");
    setError(null);

    try {
      const response = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          status,
          adminNotes: notes,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Could not update ticket");
        setState("error");
        return;
      }
      setState("idle");
    } catch (err) {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-white/50">
          Status
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-white/50">
          Admin notes
        </label>
        <textarea
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
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
        onClick={save}
        disabled={state === "saving"}
        className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state === "saving" ? "Saving..." : "Save updates"}
      </button>
    </div>
  );
}
