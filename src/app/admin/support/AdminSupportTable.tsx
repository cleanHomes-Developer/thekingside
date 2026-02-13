"use client";

import { useState } from "react";
import Link from "next/link";

type TicketRow = {
  id: string;
  userDisplayName: string;
  tournamentName: string | null;
  subject: string;
  status: string;
  createdAt: string;
};

type AdminSupportTableProps = {
  tickets: TicketRow[];
};

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export default function AdminSupportTable({ tickets }: AdminSupportTableProps) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateTicket(id: string, status: string) {
    setBusy(id);
    setError(null);
    try {
      const response = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: id,
          status,
          adminNotes: notes[id] ?? "",
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Could not update ticket");
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
      {tickets.length === 0 ? (
        <p className="text-sm text-white/60">No tickets yet.</p>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-sm text-white/70"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {ticket.status} - {ticket.userDisplayName}
                </p>
                <p className="text-base font-semibold text-white">
                  {ticket.subject}
                </p>
                <p className="text-xs text-white/40">
                  {ticket.tournamentName ?? "General"} |{" "}
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <Link
                href={`/admin/support/${ticket.id}`}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-cyan-300"
              >
                View
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              <textarea
                rows={2}
                placeholder="Admin notes"
                value={notes[ticket.id] ?? ""}
                onChange={(event) =>
                  setNotes((prev) => ({
                    ...prev,
                    [ticket.id]: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateTicket(ticket.id, status)}
                    disabled={busy === ticket.id}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
