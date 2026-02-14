"use client";

import { useEffect, useState } from "react";

type QueueStats = {
  name: string;
  paused: boolean;
  counts: {
    waiting: number;
    active: number;
    delayed: number;
    completed: number;
    failed: number;
  };
};

type QueueAlert = {
  id: string;
  createdAt: string;
  entityId: string | null;
  afterState: Record<string, unknown> | null;
};

export default function QueuesPanel() {
  const [stats, setStats] = useState<QueueStats[]>([]);
  const [alerts, setAlerts] = useState<QueueAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [queueRes, alertRes] = await Promise.all([
        fetch("/api/admin/queues"),
        fetch("/api/admin/alerts"),
      ]);
      if (!queueRes.ok) {
        const data = await queueRes.json().catch(() => null);
        setError(data?.error ?? "Unable to load queues.");
        setStats([]);
      } else {
        const data = (await queueRes.json()) as { stats: QueueStats[] };
        setStats(data.stats);
        setError(null);
      }
      if (alertRes.ok) {
        const data = (await alertRes.json()) as { alerts: QueueAlert[] };
        setAlerts(data.alerts);
      }
    } catch {
      setError("Unable to load queues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleQueue = async (name: string, paused: boolean) => {
    const route = paused ? "resume" : "pause";
    await fetch(`/api/admin/queues/${name}/${route}`, { method: "POST" });
    load();
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((queue) => (
          <div
            key={queue.name}
            className="rounded-2xl border border-white/10 bg-[#0b1426] p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{queue.name}</p>
              <button
                type="button"
                onClick={() => toggleQueue(queue.name, queue.paused)}
                className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                  queue.paused
                    ? "border-amber-300/40 text-amber-100"
                    : "border-emerald-300/40 text-emerald-100"
                }`}
                disabled={loading}
              >
                {queue.paused ? "Resume" : "Pause"}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/60">
              <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Waiting
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {queue.counts.waiting}
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Active
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {queue.counts.active}
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Delayed
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {queue.counts.delayed}
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Failed
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {queue.counts.failed}
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Completed
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {queue.counts.completed}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b1426] p-5 text-sm text-white/70">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Recent queue alerts
          </p>
          <button
            type="button"
            onClick={() => load()}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 hover:border-cyan-300"
          >
            Refresh
          </button>
        </div>
        {alerts.length === 0 ? (
          <p className="mt-3 text-xs text-white/50">No failures detected.</p>
        ) : (
          <div className="mt-4 space-y-2 text-xs text-white/60">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
              >
                <div>
                  <p className="text-white/80">Queue failure</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                  {alert.afterState && typeof alert.afterState === "object" ? (
                    <p className="mt-1 text-xs text-white/50">
                      {String((alert.afterState as Record<string, unknown>).error ?? "")}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full border border-rose-300/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-rose-200">
                  {alert.entityId ?? "Job"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
