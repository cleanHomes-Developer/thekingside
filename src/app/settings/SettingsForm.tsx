"use client";

import { useState, type FormEvent } from "react";

type SettingsFormProps = {
  user: {
    name: string;
    displayName: string;
    profile?: {
      age: number | null;
      country: string | null;
      lichessUsername: string | null;
      lichessLinkedAt?: string | null;
      profilePictureUrl: string | null;
      bio: string | null;
      kycStatus: string;
    } | null;
  };
  lichessConfigured: boolean;
};

export default function SettingsForm({
  user,
  lichessConfigured,
}: SettingsFormProps) {
  const [form, setForm] = useState({
    name: user.name ?? "",
    displayName: user.displayName ?? "",
    age: user.profile?.age ?? "",
    country: user.profile?.country ?? "",
    lichessUsername: user.profile?.lichessUsername ?? "",
    profilePictureUrl: user.profile?.profilePictureUrl ?? "",
    bio: user.profile?.bio ?? "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [lichessStatus, setLichessStatus] = useState<
    "idle" | "linking" | "linked" | "error"
  >("idle");
  const [lichessError, setLichessError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Update failed");
        setStatus("error");
        return;
      }

      setStatus("saved");
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  async function linkLichess() {
    setLichessStatus("linking");
    setLichessError(null);
    window.location.href = "/api/lichess/link";
  }

  async function devLinkLichess() {
    setLichessStatus("linking");
    setLichessError(null);
    try {
      const response = await fetch("/api/lichess/dev-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setLichessError(data?.error ?? "Could not link Lichess");
        setLichessStatus("error");
        return;
      }
      setLichessStatus("linked");
    } catch (err) {
      setLichessError("Network error. Please try again.");
      setLichessStatus("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-white/70" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="displayName">
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            value={form.displayName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, displayName: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm text-white/70" htmlFor="age">
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={13}
            max={120}
            value={form.age}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, age: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="country">
            Country
          </label>
          <input
            id="country"
            name="country"
            type="text"
            value={form.country}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, country: event.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-white/70" htmlFor="lichessUsername">
            Lichess username
          </label>
          <input
            id="lichessUsername"
            name="lichessUsername"
            type="text"
            value={form.lichessUsername}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                lichessUsername: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-white/70" htmlFor="profilePictureUrl">
          Profile photo URL
        </label>
        <input
          id="profilePictureUrl"
          name="profilePictureUrl"
          type="url"
          value={form.profilePictureUrl}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              profilePictureUrl: event.target.value,
            }))
          }
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm text-white/70" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={form.bio}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, bio: event.target.value }))
          }
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus:border-cyan-300 focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white/70">
        KYC status:{" "}
        <span className="font-semibold text-white">
          {user.profile?.kycStatus ?? "PENDING"}
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 text-sm text-white/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Lichess
            </p>
            <p className="text-sm text-white/80">
              {user.profile?.lichessUsername
                ? `Connected as ${user.profile.lichessUsername}`
                : "No Lichess username on file"}
            </p>
            {user.profile?.lichessLinkedAt ? (
              <p className="text-xs text-white/40">
                Linked {new Date(user.profile.lichessLinkedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={linkLichess}
              className="rounded-full border border-cyan-400/40 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300"
              disabled={!lichessConfigured || lichessStatus === "linking"}
            >
              {lichessStatus === "linking" ? "Linking..." : "Link Lichess"}
            </button>
            {!lichessConfigured ? (
              <button
                type="button"
                onClick={devLinkLichess}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/40"
                disabled={lichessStatus === "linking"}
              >
                Dev link
              </button>
            ) : null}
          </div>
        </div>
        {lichessError ? (
          <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {lichessError}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-full bg-cyan-400 px-5 py-2 font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "saving" ? "Saving..." : "Save changes"}
        </button>
        {status === "saved" ? (
          <span className="text-sm text-green-300">Saved.</span>
        ) : null}
      </div>
    </form>
  );
}
