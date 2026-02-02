"use client";

import { useState } from "react";

export default function AffiliateSeedButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleSeed() {
    setStatus("loading");
    setMessage(null);
    try {
      const response = await fetch("/api/admin/affiliates/seed", {
        method: "POST",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(data?.error ?? "Could not seed affiliates");
        setStatus("error");
        return;
      }
      setStatus("done");
      setMessage(`Seeded ${data?.count ?? 0} programs.`);
      window.location.reload();
    } catch (err) {
      setMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleSeed}
        disabled={status === "loading"}
        className="rounded-full border border-cyan-300/40 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Seeding..." : "Seed affiliate programs"}
      </button>
      {message ? <span className="text-xs text-white/60">{message}</span> : null}
    </div>
  );
}
