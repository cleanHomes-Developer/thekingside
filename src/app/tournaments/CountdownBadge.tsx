"use client";

import { useEffect, useState } from "react";

type CountdownBadgeProps = {
  target: string;
  label: string;
};

function formatDuration(ms: number) {
  if (ms <= 0) {
    return "0m";
  }
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  }
  return `${minutes}m`;
}

export default function CountdownBadge({ target, label }: CountdownBadgeProps) {
  const [remaining, setRemaining] = useState(() => {
    return new Date(target).getTime() - Date.now();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(new Date(target).getTime() - Date.now());
    }, 1000 * 30);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-cyan-100">
      {label} {formatDuration(remaining)}
    </span>
  );
}
