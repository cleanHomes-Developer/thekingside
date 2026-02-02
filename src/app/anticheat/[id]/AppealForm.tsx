"use client";

import { useState } from "react";

type AppealFormProps = {
  caseId: string;
  status: string;
  appealText: string | null;
};

export default function AppealForm({
  caseId,
  status,
  appealText,
}: AppealFormProps) {
  const [text, setText] = useState(appealText ?? "");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const isClosed = status === "RESOLVED" || status === "DISMISSED";

  async function submitAppeal() {
    setState("sending");
    setError(null);

    try {
      const response = await fetch(`/api/anticheat/cases/${caseId}/appeal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appealText: text }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not submit appeal");
        setState("error");
        return;
      }

      setState("sent");
    } catch (err) {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        rows={4}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
        placeholder="Explain why this should be dismissed..."
        disabled={isClosed}
      />
      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={submitAppeal}
        disabled={isClosed || text.trim().length < 10 || state === "sending"}
        className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isClosed
          ? "Case closed"
          : state === "sending"
            ? "Submitting..."
            : state === "sent"
              ? "Appeal sent"
              : "Submit appeal"}
      </button>
    </div>
  );
}
