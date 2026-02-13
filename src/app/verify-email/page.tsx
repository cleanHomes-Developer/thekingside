"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }
    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setStatus("error");
          setMessage(data?.error ?? "Verification failed.");
          return;
        }
        setStatus("ok");
        setMessage("Your email has been verified.");
      } catch {
        setStatus("error");
        setMessage("Verification failed.");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-8">
        <h1 className="text-2xl font-semibold">
          {status === "ok" ? "Email verified" : status === "error" ? "Verification failed" : "Verifying"}
        </h1>
        <p className="text-white/70">{message}</p>
        <Link
          href="/dashboard"
          className="inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
