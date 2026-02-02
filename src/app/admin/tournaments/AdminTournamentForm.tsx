"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatCurrency } from "@/lib/format";

const tournamentTypes = ["QUALIFIER", "SEMIFINAL", "WILDCARD", "FINAL"];

function buildInitialState(isFreeSeason: boolean) {
  return {
    name: "",
    type: "QUALIFIER",
    entryFee: isFreeSeason ? "0" : "10",
    minPlayers: "8",
    maxPlayers: "16",
    startDate: "",
    endDate: "",
    timeControl: "5+5",
    seriesKey: "",
    slotKey: "",
    description: "",
  };
}

type AdminTournamentFormProps = {
  isFreeSeason: boolean;
  freePrizePool: number;
};

export default function AdminTournamentForm({
  isFreeSeason,
  freePrizePool,
}: AdminTournamentFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(() => buildInitialState(isFreeSeason));
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    const payload = {
      ...form,
      entryFee: isFreeSeason ? 0 : Number(form.entryFee),
      minPlayers: Number(form.minPlayers),
      maxPlayers: Number(form.maxPlayers),
      startDate: form.startDate ? new Date(form.startDate).toISOString() : "",
      endDate: form.endDate ? new Date(form.endDate).toISOString() : "",
    };

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not create tournament");
        setStatus("error");
        return;
      }

      setForm(buildInitialState(isFreeSeason));
      setStatus("idle");
      router.refresh();
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
      <h2 className="text-lg font-semibold text-cyan-200">
        Create tournament
      </h2>
      {isFreeSeason ? (
        <p className="rounded-lg border border-cyan-400/30 bg-[rgba(15,23,42,0.7)] px-3 py-2 text-xs text-cyan-100">
          Free season is active. Entry fees are forced to $0 and new prize
          pools seed at {formatCurrency(freePrizePool)}.
        </p>
      ) : null}
      <div>
        <label className="text-sm text-white/70" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm text-white/70" htmlFor="type">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, type: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          >
            {tournamentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="entryFee">
            Entry fee
          </label>
          <input
            id="entryFee"
            name="entryFee"
            type="number"
            min={0}
            step="0.01"
            required
            value={isFreeSeason ? "0" : form.entryFee}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, entryFee: event.target.value }))
            }
            disabled={isFreeSeason}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="minPlayers">
            Min players
          </label>
          <input
            id="minPlayers"
            name="minPlayers"
            type="number"
            min={2}
            required
            value={form.minPlayers}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, minPlayers: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm text-white/70" htmlFor="maxPlayers">
            Max players
          </label>
          <input
            id="maxPlayers"
            name="maxPlayers"
            type="number"
            min={2}
            required
            value={form.maxPlayers}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, maxPlayers: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="startDate">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            required
            value={form.startDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, startDate: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="endDate">
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="datetime-local"
            value={form.endDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, endDate: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm text-white/70" htmlFor="timeControl">
            Time control
          </label>
          <input
            id="timeControl"
            name="timeControl"
            value={form.timeControl}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, timeControl: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
            placeholder="5+3"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="seriesKey">
            Series key
          </label>
          <input
            id="seriesKey"
            name="seriesKey"
            value={form.seriesKey}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, seriesKey: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="slotKey">
            Slot key
          </label>
          <input
            id="slotKey"
            name="slotKey"
            value={form.slotKey}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, slotKey: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-white/70" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "saving" ? "Creating..." : "Create tournament"}
      </button>
    </form>
  );
}
