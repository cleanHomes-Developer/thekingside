"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordConfirmPage() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Reset failed.");
      } else {
        setStatus("Password updated. You can sign in now.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-8">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <p className="text-white/70">
          Choose a strong password to secure your account.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/70" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none"
              placeholder="At least 8 characters"
            />
          </div>
          {error ? (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          {status ? (
            <p className="rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
              {status}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
        <Link className="text-sm text-cyan-200 hover:text-cyan-100" href="/login">
          Back to login
        </Link>
      </div>
    </div>
  );
}
