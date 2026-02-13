"use client";

import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  Sentry.captureException(error);

  return (
    <html>
      <body className="bg-[#070b16] text-white">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-lg rounded-2xl border border-white/10 bg-[#0b1426] p-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              System
            </p>
            <h1 className="mt-3 text-2xl font-semibold">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-white/60">
              The error has been reported. Please try again.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-5 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
