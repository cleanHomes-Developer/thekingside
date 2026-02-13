import Link from "next/link";

const isometricBackground = {
  backgroundColor: "#030712",
  backgroundImage: `
    repeating-linear-gradient(
      90deg,
      rgba(0, 217, 255, 0.08),
      rgba(0, 217, 255, 0.08) 1px,
      transparent 1px,
      transparent 32px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(251, 191, 36, 0.08),
      rgba(251, 191, 36, 0.08) 1px,
      transparent 1px,
      transparent 32px
    ),
    radial-gradient(circle at top left, rgba(0, 217, 255, 0.25), transparent 55%),
    radial-gradient(circle at bottom right, rgba(15, 23, 42, 0.6), transparent 45%)
  `,
  backgroundSize: "32px 32px, 32px 32px, 100% 100%, 120% 120%",
  backgroundBlendMode: "screen, screen, soft-light, multiply",
};

export default function IsometricPage() {
  return (
    <div className="min-h-screen text-white" style={isometricBackground}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-24">
        <section className="rounded-[32px] border border-white/20 bg-white/5 p-10 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">
            Experimental layer
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">
            Isometric chess grid
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/70">
            This page is purely experimental - an isometric chess board motif
            built with layered gradients. The skewed grid mimics depth so your
            pieces feel like they are floating on a premium table.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/"
              className="rounded-full bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              Return home
            </Link>
            <Link
              href="/play"
              className="rounded-full border border-white/30 px-6 py-3 text-base text-white/80 transition hover:border-cyan-300 hover:text-white"
            >
              Jump to lobby
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {["Depth", "Movement", "Focus"].map((card) => (
            <div
              key={card}
              className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/70"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                {card}
              </p>
              <p className="mt-3 text-lg text-white">
                The gradients fold like tiles, giving the illusion of an
                isometric surface while staying fast and CSS-only.
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
