"use client";

import { useState } from "react";
import Link from "next/link";

type CaseRow = {
  id: string;
  userDisplayName: string;
  tournamentName: string;
  status: string;
  riskLevel: string;
  createdAt: string;
};

type AdminAnticheatTableProps = {
  cases: CaseRow[];
};

export default function AdminAnticheatTable({
  cases,
}: AdminAnticheatTableProps) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resolveCase(id: string, status: "RESOLVED" | "DISMISSED") {
    setBusy(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/anticheat/cases/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes: notes[id] ?? "",
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not resolve case");
        return;
      }
      window.location.reload();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {cases.length === 0 ? (
        <p className="text-sm text-white/60">No cases filed.</p>
      ) : (
        cases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-sm text-white/70"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {caseItem.riskLevel} risk - {caseItem.status}
                </p>
                <p className="text-base font-semibold text-white">
                  {caseItem.userDisplayName} - {caseItem.tournamentName}
                </p>
                <p className="text-xs text-white/40">
                  Opened {new Date(caseItem.createdAt).toLocaleString()}
                </p>
              </div>
              <Link
                href={`/admin/anticheat/${caseItem.id}`}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-cyan-300"
              >
                View
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              <textarea
                rows={2}
                placeholder="Admin notes (optional)"
                value={notes[caseItem.id] ?? ""}
                onChange={(event) =>
                  setNotes((prev) => ({
                    ...prev,
                    [caseItem.id]: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => resolveCase(caseItem.id, "RESOLVED")}
                  disabled={busy === caseItem.id}
                  className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Resolve
                </button>
                <button
                  type="button"
                  onClick={() => resolveCase(caseItem.id, "DISMISSED")}
                  disabled={busy === caseItem.id}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
