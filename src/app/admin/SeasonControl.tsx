"use client";

import { useState, type FormEvent } from "react";
import { formatCurrency } from "@/lib/format";

type SeasonControlProps = {
  mode: "free" | "paid";
  freePrizePool: number;
  prizeMode: "gift_card" | "cash";
  sponsorshipEnabled: boolean;
  sponsorSlots: number;
};

export default function SeasonControl({
  mode,
  freePrizePool,
  prizeMode,
  sponsorshipEnabled,
  sponsorSlots,
}: SeasonControlProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    mode,
    freePrizePool: freePrizePool.toString(),
    prizeMode,
    sponsorshipEnabled,
    sponsorSlots: sponsorSlots.toString(),
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    const payload = {
      mode: form.mode,
      freePrizePool: Number(form.freePrizePool),
      prizeMode: form.prizeMode,
      sponsorshipEnabled: form.sponsorshipEnabled,
      sponsorSlots: Number(form.sponsorSlots),
    };

    try {
      const response = await fetch("/api/admin/season", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not update season");
        setStatus("error");
        return;
      }

      setStatus("idle");
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Season controls
          </p>
          <h2 className="text-xl font-semibold text-white">
            Free vs paid mode
          </h2>
          <p className="text-sm text-white/60">
            Toggle entry fees and seed prize pools for new tournaments.
          </p>
        </div>
        <div className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-100">
          Current: {form.mode === "free" ? "Free" : "Paid"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div>
          <label className="text-sm text-white/70" htmlFor="seasonMode">
            Season mode
          </label>
          <select
            id="seasonMode"
            value={form.mode}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                mode: event.target.value as "free" | "paid",
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="prizeMode">
            Prize mode
          </label>
          <select
            id="prizeMode"
            value={form.prizeMode}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                prizeMode: event.target.value as "gift_card" | "cash",
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          >
            <option value="gift_card">Gift card</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div>
          <label
            className="text-sm text-white/70"
            htmlFor="sponsorshipEnabled"
          >
            Sponsorships
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="sponsorshipEnabled"
              type="checkbox"
              checked={form.sponsorshipEnabled}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  sponsorshipEnabled: event.target.checked,
                }))
              }
              className="h-4 w-4 accent-cyan-300"
            />
            <span className="text-xs text-white/60">
              Enable sponsor slots on public pages
            </span>
          </div>
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="sponsorSlots">
            Sponsor slots
          </label>
          <input
            id="sponsorSlots"
            type="number"
            min={1}
            max={5}
            step="1"
            value={form.sponsorSlots}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, sponsorSlots: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div>
          <label className="text-sm text-white/70" htmlFor="freePrizePool">
            Free season prize seed
          </label>
          <input
            id="freePrizePool"
            type="number"
            min={0}
            step="1"
            value={form.freePrizePool}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, freePrizePool: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
          <p className="mt-2 text-xs text-white/50">
            Currently seeded at {formatCurrency(form.freePrizePool)} per new
            tournament.
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
        <span>
          Changes apply to new tournaments and new entries immediately.
        </span>
      </div>

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "saving" ? "Saving..." : "Save season settings"}
      </button>
    </form>
  );
}
