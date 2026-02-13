"use client";

import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  subject: string;
  body: string;
  status: string;
  audience: string;
  sentCount: number;
  failedCount: number;
  scheduledAt: string | null;
  createdAt: string;
};

type Audience = "ALL" | "RANDOM" | "SELECTED";

const initialForm = {
  title: "",
  subject: "",
  body: "",
  audience: "ALL" as Audience,
  randomCount: "1",
  userIds: "",
  scheduledAt: "",
};

export default function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/announcements");
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as { announcements: Announcement[] };
    setAnnouncements(data.announcements);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);
    const payload: Record<string, unknown> = {
      title: form.title,
      subject: form.subject,
      body: form.body,
      audience: form.audience,
    };
    if (form.audience === "RANDOM") {
      payload.randomCount = Number(form.randomCount || "1");
    }
    if (form.audience === "SELECTED") {
      payload.userIds = form.userIds
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
    if (form.scheduledAt) {
      payload.scheduledAt = new Date(form.scheduledAt).toISOString();
    }
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      setNotice("Unable to create announcement.");
      return;
    }
    setForm(initialForm);
    setNotice("Announcement created.");
    load();
  };

  const sendAnnouncement = async (id: string) => {
    setNotice(null);
    const res = await fetch(`/api/admin/announcements/${id}/send`, {
      method: "POST",
    });
    if (!res.ok) {
      setNotice("Unable to queue announcement.");
      return;
    }
    setNotice("Announcement queued.");
    load();
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-[#0b1426] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Create announcement
            </p>
            <p className="text-sm text-white/60">
              Draft a broadcast to players or a targeted group.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save draft"}
          </button>
        </div>

        {notice ? (
          <p className="mt-3 text-xs text-cyan-200">{notice}</p>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-xs text-white/60">
            Title
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              required
            />
          </label>
          <label className="text-xs text-white/60">
            Subject
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
              value={form.subject}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, subject: event.target.value }))
              }
              required
            />
          </label>
          <label className="md:col-span-2 text-xs text-white/60">
            Body
            <textarea
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
              rows={5}
              value={form.body}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, body: event.target.value }))
              }
              required
            />
          </label>
          <label className="text-xs text-white/60">
            Audience
            <select
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
              value={form.audience}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  audience: event.target.value as Audience,
                }))
              }
            >
              <option value="ALL">All players</option>
              <option value="RANDOM">Random selection</option>
              <option value="SELECTED">Selected users</option>
            </select>
          </label>
          <label className="text-xs text-white/60">
            Schedule (optional)
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  scheduledAt: event.target.value,
                }))
              }
            />
            <span className="mt-2 block text-[10px] text-white/40">
              Uses your local time. Stored in UTC.
            </span>
          </label>
          {form.audience === "RANDOM" ? (
            <label className="text-xs text-white/60">
              Random count
              <input
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                type="number"
                min={1}
                value={form.randomCount}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    randomCount: event.target.value,
                  }))
                }
              />
            </label>
          ) : null}
          {form.audience === "SELECTED" ? (
            <label className="md:col-span-2 text-xs text-white/60">
              User IDs (comma separated)
              <input
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                value={form.userIds}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    userIds: event.target.value,
                  }))
                }
              />
            </label>
          ) : null}
        </div>
      </form>

      <div className="rounded-2xl border border-white/10 bg-[#0b1426] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Recent announcements
            </p>
            <p className="text-sm text-white/60">
              Track delivery and queue status.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 hover:border-cyan-300"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {announcements.length === 0 ? (
            <p className="text-sm text-white/60">No announcements yet.</p>
          ) : (
            announcements.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-white">{item.title}</p>
                    <p className="text-xs text-white/40">
                      {item.subject} | {item.audience} | {item.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/admin/announcements/${item.id}`}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 hover:border-cyan-300"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => sendAnnouncement(item.id)}
                      className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-cyan-300"
                      disabled={item.status === "SENT" || item.status === "SENDING"}
                    >
                      Send
                    </button>
                  </div>
                </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/50">
                    <span>Sent: {item.sentCount}</span>
                    <span>Failed: {item.failedCount}</span>
                    {item.scheduledAt ? (
                      <span>
                        Scheduled: {new Date(item.scheduledAt).toLocaleString()}
                      </span>
                    ) : null}
                    <span>
                      Created: {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
