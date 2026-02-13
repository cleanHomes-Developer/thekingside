"use client";

import { useState } from "react";

export default function VerifyEmailBanner({ verified }: { verified: boolean }) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (verified) {
    return null;
  }

  const requestVerification = async () => {
    setLoading(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-verification", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Verification email failed.");
      } else {
        setStatus("Verification email sent.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-5 text-sm text-cyan-100">
      <p className="font-semibold text-white">Verify your email</p>
      <p className="mt-2 text-white/70">
        Email verification unlocks account recovery and security alerts.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={requestVerification}
          disabled={loading}
          className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-70"
        >
          {loading ? "Sending..." : "Send verification email"}
        </button>
        {status ? <span className="text-xs text-cyan-100">{status}</span> : null}
        {error ? <span className="text-xs text-red-200">{error}</span> : null}
      </div>
    </div>
  );
}
