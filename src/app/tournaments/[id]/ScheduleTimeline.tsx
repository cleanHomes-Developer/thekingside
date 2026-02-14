"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";

type TimelineProps = {
  checkInOpensAt: string;
  lockAt: string;
  startAt: string;
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

export default function ScheduleTimeline({
  checkInOpensAt,
  lockAt,
  startAt,
}: TimelineProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const steps = useMemo(() => {
    return [
      { label: "Check-in opens", time: new Date(checkInOpensAt).getTime() },
      { label: "Lock", time: new Date(lockAt).getTime() },
      { label: "Start", time: new Date(startAt).getTime() },
    ];
  }, [checkInOpensAt, lockAt, startAt]);

  const nextStep = steps.find((step) => step.time > now) ?? null;
  const nextLabel = nextStep ? nextStep.label : "Live";
  const nextCountdown = nextStep ? formatDuration(nextStep.time - now) : "0m";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1426] p-4 text-xs text-white/70">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
          Registration timeline
        </p>
        <span className="rounded-full border border-cyan-300/30 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
          {nextLabel}: {nextCountdown}
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => {
          const isComplete = now >= step.time;
          const isCurrent =
            now >= step.time &&
            (index === steps.length - 1 || now < steps[index + 1].time);
          return (
            <div
              key={step.label}
              className={`rounded-xl border px-3 py-3 ${
                isCurrent
                  ? "border-cyan-300/40 bg-cyan-400/10"
                  : isComplete
                    ? "border-emerald-300/20 bg-emerald-500/5"
                    : "border-white/10 bg-slate-950/40"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                {step.label}
              </p>
              <p className="mt-2 text-sm text-white/80">
                {formatDateTime(new Date(step.time))}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
                {isCurrent ? "Current" : isComplete ? "Complete" : "Upcoming"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
