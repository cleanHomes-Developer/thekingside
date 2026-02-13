"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

const initialState = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const retry = response.headers.get("Retry-After");
        setRetryAfter(retry ? Number(retry) : null);
        setError(data?.error ?? "Login failed");
        return;
      }

      setForm(initialState);
      router.push("/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6"
    >
      <div>
        <label className="text-sm text-white/70" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="text-sm text-white/70" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none"
          placeholder="********"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
          {retryAfter ? ` (Retry in ${retryAfter}s)` : ""}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-white/60">
        New here?{" "}
        <Link className="text-cyan-300 hover:text-cyan-200" href="/register">
          Create an account
        </Link>
      </p>
      <p className="text-center text-xs text-white/50">
        <Link className="text-cyan-200 hover:text-cyan-100" href="/reset-password">
          Forgot your password?
        </Link>
      </p>
    </form>
  );
}

