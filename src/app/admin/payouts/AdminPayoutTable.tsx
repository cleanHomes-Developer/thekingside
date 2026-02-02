"use client";

import { useState } from "react";

type PayoutRow = {
  id: string;
  userDisplayName: string;
  tournamentName: string;
  amount: string;
  status: string;
  antiCheatHold: boolean;
};

type AdminPayoutTableProps = {
  payouts: PayoutRow[];
};

export default function AdminPayoutTable({ payouts }: AdminPayoutTableProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updatePayout(id: string, action: "approve" | "reject") {
    setBusy(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/payouts/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Could not update payout");
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
      {payouts.length === 0 ? (
        <p className="text-sm text-white/60">No payouts requested.</p>
      ) : (
        payouts.map((payout) => (
          <div
            key={payout.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-sm text-white/70"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                {payout.status} {payout.antiCheatHold ? "(Hold)" : ""}
              </p>
              <p className="text-base font-semibold text-white">
                {payout.userDisplayName} - {payout.tournamentName}
              </p>
              <p className="text-xs text-white/40">{payout.amount}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updatePayout(payout.id, "approve")}
                disabled={busy === payout.id || payout.antiCheatHold}
                className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => updatePayout(payout.id, "reject")}
                disabled={busy === payout.id}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
