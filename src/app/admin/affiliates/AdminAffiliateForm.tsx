"use client";

import { useState, type FormEvent } from "react";
import { affiliateCategories } from "@/lib/affiliates/categories";

const initialState = {
  name: "",
  category: "GAMING_HARDWARE",
  commissionRate: "",
  cookieDuration: "",
  websiteUrl: "",
  affiliateUrl: "",
  notes: "",
  active: false,
  sortOrder: "0",
};

export default function AdminAffiliateForm() {
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
      affiliateUrl: form.affiliateUrl || null,
      notes: form.notes || null,
    };

    try {
      const response = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not create affiliate program");
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
        Add affiliate program
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-white/70" htmlFor="name">
            Program name
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
            {affiliateCategories.map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-white/70" htmlFor="commissionRate">
            Commission rate
          </label>
          <input
            id="commissionRate"
            name="commissionRate"
            required
            value={form.commissionRate}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                commissionRate: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
            placeholder="5% or $10 per sale"
          />
        </div>
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
            placeholder="30 days"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-white/70" htmlFor="notes">
          Notes (optional)
        </label>
        <input
          id="notes"
          name="notes"
          value={form.notes}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, notes: event.target.value }))
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
          <label className="text-sm text-white/70" htmlFor="affiliateUrl">
            Affiliate URL (required when active)
          </label>
          <input
            id="affiliateUrl"
            name="affiliateUrl"
            value={form.affiliateUrl}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, affiliateUrl: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
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
              setForm((prev) => ({ ...prev, sortOrder: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
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
        {status === "saving" ? "Saving..." : "Create affiliate"}
      </button>
    </form>
  );
}
