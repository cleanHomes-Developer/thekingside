"use client";

import { useState } from "react";

type CheckInButtonProps = {
  tournamentId: string;
  checkedInAt: string | null;
  disabled: boolean;
};

export default function CheckInButton({
  tournamentId,
  checkedInAt,
  disabled,
}: CheckInButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    checkedInAt ? "done" : "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleCheckIn() {
    setStatus("loading");
    setMessage(null);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/check-in`, {
        method: "POST",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(data?.error ?? "Could not check in");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch (err) {
      setMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheckIn}
        disabled={disabled || status === "loading" || status === "done"}
        className="rounded-full border border-cyan-300/40 px-4 py-1 text-xs text-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading"
          ? "Checking in..."
          : status === "done"
            ? "Checked in"
            : "Check in"}
      </button>
      {message ? (
        <p className="text-xs text-red-200">{message}</p>
      ) : null}
    </div>
  );
}
