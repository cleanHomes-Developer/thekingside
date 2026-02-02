"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const tiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"] as const;

type SponsorFormData = {
  id: string;
  name: string;
  tier: string;
  logoUrl: string;
  websiteUrl: string;
  tagline: string;
  active: boolean;
  sortOrder: string;
  startsAt: string;
  endsAt: string;
};

type AdminSponsorEditFormProps = {
  sponsor: SponsorFormData;
};

function toLocalDateTime(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function AdminSponsorEditForm({
  sponsor,
}: AdminSponsorEditFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...sponsor,
    startsAt: toLocalDateTime(sponsor.startsAt),
    endsAt: toLocalDateTime(sponsor.endsAt),
  });
  const [status, setStatus] = useState<
    "idle" | "saving" | "deleting" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function updateSponsor(event: FormEvent<HTMLFormElement>) {
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
      const response = await fetch(`/api/admin/sponsors/${sponsor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not update sponsor");
        setStatus("error");
        return;
      }

      setStatus("idle");
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  async function deleteSponsor() {
    setStatus("deleting");
    setError(null);

    try {
      const response = await fetch(`/api/admin/sponsors/${sponsor.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not delete sponsor");
        setStatus("error");
        return;
      }

      router.push("/admin/sponsors");
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={updateSponsor}
      className="space-y-4 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-cyan-200">Edit sponsor</h2>
        <button
          type="button"
          onClick={deleteSponsor}
          disabled={status === "deleting"}
          className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold text-red-200 transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "deleting" ? "Deleting..." : "Delete"}
        </button>
      </div>

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
        {status === "saving" ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
