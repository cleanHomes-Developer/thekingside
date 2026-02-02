"use client";

import { useState } from "react";

type ConnectStripeButtonProps = {
  connected: boolean;
};

export default function ConnectStripeButton({
  connected,
}: ConnectStripeButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function startOnboarding() {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/stripe-connect/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Could not start onboarding");
        setStatus("error");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
      <h2 className="text-base font-semibold text-cyan-200">Stripe Connect</h2>
      <p className="mt-2 text-sm text-white/60">
        {connected
          ? "Your payout account is connected."
          : "Connect Stripe to receive payouts."}
      </p>
      {error ? (
        <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={startOnboarding}
        disabled={connected || status === "loading"}
        className="mt-4 rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {connected
          ? "Connected"
          : status === "loading"
            ? "Opening..."
            : "Connect Stripe"}
      </button>
    </div>
  );
}
