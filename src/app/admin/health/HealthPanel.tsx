"use client";

import { useEffect, useState } from "react";

type HealthStatus = {
  redis: {
    status: string;
    latencyMs: number | null;
    message?: string;
  };
  stripe: {
    status: string;
    message?: string;
  };
  database: {
    status: string;
    message?: string;
  };
  sentry: {
    status: string;
  };
  checkedAt: string;
};

function StatusPill({ status }: { status: string }) {
  const color =
    status === "ok"
      ? "border-emerald-400/40 text-emerald-200"
      : status === "timeout"
        ? "border-amber-400/40 text-amber-200"
        : status === "configured"
          ? "border-cyan-400/40 text-cyan-200"
          : "border-rose-400/40 text-rose-200";
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] ${color}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export default function HealthPanel() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/health");
        if (!res.ok) {
          throw new Error(`Health check failed (${res.status})`);
        }
        const data = (await res.json()) as HealthStatus;
        if (active) {
          setStatus(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(String(err));
        }
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Platform health
          </p>
          <h2 className="text-2xl font-semibold">Live status</h2>
        </div>
        {status ? (
          <p className="text-xs text-white/50">
            Checked {new Date(status.checkedAt).toLocaleTimeString()}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#0b1426] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Redis</p>
            {status ? <StatusPill status={status.redis.status} /> : null}
          </div>
          <p className="mt-2 text-xs text-white/60">
            Latency:{" "}
            {status?.redis.latencyMs !== null
              ? `${status.redis.latencyMs}ms`
              : "n/a"}
          </p>
          {status?.redis.message ? (
            <p className="mt-2 text-xs text-white/40">{status.redis.message}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0b1426] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Stripe</p>
            {status ? <StatusPill status={status.stripe.status} /> : null}
          </div>
          {status?.stripe.message ? (
            <p className="mt-2 text-xs text-white/40">{status.stripe.message}</p>
          ) : (
            <p className="mt-2 text-xs text-white/60">
              API connectivity and credentials.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0b1426] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Database</p>
            {status ? <StatusPill status={status.database.status} /> : null}
          </div>
          {status?.database.message ? (
            <p className="mt-2 text-xs text-white/40">
              {status.database.message}
            </p>
          ) : (
            <p className="mt-2 text-xs text-white/60">
              Postgres connectivity.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0b1426] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Sentry</p>
            {status ? <StatusPill status={status.sentry.status} /> : null}
          </div>
          <p className="mt-2 text-xs text-white/60">
            Error reporting configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
