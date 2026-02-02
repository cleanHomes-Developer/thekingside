import type { Metadata } from "next";
import PlayPanel from "./PlayPanel";

export const metadata: Metadata = {
  title: "Play Chess Matches",
  description:
    "Play fast chess matches, practice, and join the live lobby on The King Side.",
  alternates: {
    canonical: "/play",
  },
  openGraph: {
    title: "Play Chess Matches",
    description:
      "Play fast chess matches, practice, and join the live lobby on The King Side.",
    url: "https://thekingside.com/play",
    siteName: "The King Side",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Chess Matches",
    description:
      "Play fast chess matches, practice, and join the live lobby on The King Side.",
  },
};

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-[#070b16] text-white">
      <div className="mx-auto w-full max-w-[1680px] px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Play</h1>
          <p className="text-sm text-white/60">
            Choose player or bot mode below.
          </p>
        </div>
        <div className="mt-8">
          <PlayPanel />
        </div>
      </div>
    </div>
  );
}
