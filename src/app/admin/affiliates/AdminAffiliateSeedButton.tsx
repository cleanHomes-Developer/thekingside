"use client";

import { useState } from "react";

export default function AdminAffiliateSeedButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSeed() {
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/affiliates/seed", {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setMessage(data?.error ?? "Could not load default programs.");
        setStatus("error");
        return;
      }
      const data = await response.json();
      setMessage(`Created ${data.created} program(s).`);
      setStatus("idle");
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
        onClick={onSeed}
        disabled={status === "loading"}
        className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Loading..." : "Load default programs"}
      </button>
      {message ? <p className="text-xs text-white/60">{message}</p> : null}
    </div>
  );
}
