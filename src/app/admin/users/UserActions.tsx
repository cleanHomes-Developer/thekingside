"use client";

import { useMemo, useState } from "react";

type Props = {
  userId: string;
  email: string;
  kycStatus: "PENDING" | "VERIFIED" | "REJECTED";
};

const kycOptions = ["PENDING", "VERIFIED", "REJECTED"] as const;

export default function UserActions({ userId, email, kycStatus }: Props) {
  const [status, setStatus] = useState(kycStatus);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasChanges = useMemo(() => status !== kycStatus, [status, kycStatus]);

  const updateKyc = async () => {
    if (!hasChanges) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, kycStatus: status }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "KYC update failed");
      }
      setMessage("KYC updated");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Unable to update KYC status",
      );
    } finally {
      setBusy(false);
    }
  };

  const impersonate = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Impersonation failed");
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Unable to impersonate user",
      );
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as Props["kycStatus"])
          }
          className="rounded-md border border-white/10 bg-[#0b1426] px-2 py-1 text-xs text-white/80"
          disabled={busy}
        >
          {kycOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={updateKyc}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            hasChanges
              ? "bg-cyan-400 text-slate-900 hover:bg-cyan-300"
              : "bg-white/10 text-white/40"
          }`}
          disabled={busy || !hasChanges}
        >
          Save KYC
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={impersonate}
          className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 transition hover:border-cyan-300"
          disabled={busy}
        >
          Impersonate
        </button>
        <span className="text-[11px] text-white/40">{email}</span>
      </div>
      {message ? (
        <p className="text-[11px] text-white/50">{message}</p>
      ) : null}
    </div>
  );
}
