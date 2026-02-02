"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const categories = [
  "HARDWARE",
  "PLATFORMS",
  "STREAMING",
  "MARKETPLACES",
  "GENERAL",
] as const;

const commissionTypes = ["PERCENT", "FLAT", "VARIABLE"] as const;

type AffiliateFormData = {
  id: string;
  name: string;
  category: string;
  commissionType: string;
  commissionRange: string;
  cookieDuration: string;
  notes: string;
  affiliateUrl: string;
  enabled: boolean;
  sortOrder: string;
};

type AdminAffiliateEditFormProps = {
  program: AffiliateFormData;
};

export default function AdminAffiliateEditForm({
  program,
}: AdminAffiliateEditFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({ ...program });
  const [status, setStatus] = useState<
    "idle" | "saving" | "deleting" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function updateProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    const payload = {
      ...form,
      enabled: Boolean(form.enabled),
      sortOrder: Number(form.sortOrder),
      notes: form.notes || null,
    };

    try {
      const response = await fetch(`/api/admin/affiliates/${program.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not update program");
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

  async function deleteProgram() {
    setStatus("deleting");
    setError(null);

    try {
      const response = await fetch(`/api/admin/affiliates/${program.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not delete program");
        setStatus("error");
        return;
      }

      router.push("/admin/affiliates");
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={updateProgram}
      className="space-y-4 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-cyan-200">Edit affiliate</h2>
        <button
          type="button"
          onClick={deleteProgram}
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
          <label className="text-sm text-white/70" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, category: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-white/70" htmlFor="commissionType">
            Commission type
          </label>
          <select
            id="commissionType"
            value={form.commissionType}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                commissionType: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          >
            {commissionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="commissionRange">
            Commission rate
          </label>
          <input
            id="commissionRange"
            name="commissionRange"
            required
            value={form.commissionRange}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                commissionRange: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-white/70" htmlFor="cookieDuration">
            Cookie duration
          </label>
          <input
            id="cookieDuration"
            name="cookieDuration"
            required
            value={form.cookieDuration}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                cookieDuration: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="affiliateUrl">
            Affiliate URL
          </label>
          <input
            id="affiliateUrl"
            name="affiliateUrl"
            required
            value={form.affiliateUrl}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                affiliateUrl: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-white/70" htmlFor="notes">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, notes: event.target.value }))
          }
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
              setForm((prev) => ({
                ...prev,
                sortOrder: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <input
            id="enabled"
            type="checkbox"
            checked={form.enabled}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, enabled: event.target.checked }))
            }
            className="h-4 w-4 accent-cyan-300"
          />
          <label htmlFor="enabled">Enabled</label>
        </div>
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
        {status === "saving" ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
