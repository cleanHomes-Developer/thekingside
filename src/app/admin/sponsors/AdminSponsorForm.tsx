"use client";

import { useState, type FormEvent } from "react";

const tiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"] as const;

const initialState = {
  name: "",
  tier: "GOLD",
  logoUrl: "",
  websiteUrl: "",
  tagline: "",
  active: true,
  sortOrder: "0",
  startsAt: "",
  endsAt: "",
};

export default function AdminSponsorForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    const payload = {
      ...form,
      active: Boolean(form.active),
      sortOrder: Number(form.sortOrder),
      websiteUrl: form.websiteUrl || null,
      tagline: form.tagline || null,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };

    try {
      const response = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not create sponsor");
        setStatus("error");
        return;
      }

      setForm(initialState);
      setStatus("idle");
      window.location.reload();
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
        Add sponsor
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
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
        <div>
          <label className="text-sm text-white/70" htmlFor="tier">
            Tier
          </label>
          <select
            id="tier"
            value={form.tier}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, tier: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          >
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-white/70" htmlFor="logoUrl">
          Logo URL
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          required
          value={form.logoUrl}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, logoUrl: event.target.value }))
          }
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-white/70" htmlFor="websiteUrl">
            Website URL (optional)
          </label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            value={form.websiteUrl}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, websiteUrl: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="sortOrder">
            Sort order
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            max={100}
            value={form.sortOrder}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, sortOrder: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-white/70" htmlFor="tagline">
          Tagline (optional)
        </label>
        <input
          id="tagline"
          name="tagline"
          value={form.tagline}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, tagline: event.target.value }))
          }
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-white/70" htmlFor="startsAt">
            Starts at (optional)
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, startsAt: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="endsAt">
            Ends at (optional)
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            value={form.endsAt}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, endsAt: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, active: event.target.checked }))
          }
          className="h-4 w-4 accent-cyan-300"
        />
        Active
      </label>

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
        {status === "saving" ? "Saving..." : "Create sponsor"}
      </button>
    </form>
  );
}
