import MasteryPlayPanel from "./MasteryPlayPanel";

export const metadata = {
  title: "Mastery Play - The King Side",
};

export default function MasteryPlayPage() {
  return (
    <div className="mx-auto max-w-[1800px] px-6 pb-20 pt-10">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">
          Mastery Play
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Play for growth, not for a number.
        </h1>
        <p className="max-w-2xl text-sm text-white/60">
          Your rating still powers matchmaking behind the scenes, but your
          progress is measured by a living skill tree. Win or lose, you see
          exactly what improved and what to train next.
        </p>
      </div>
      <div className="mt-10">
        <MasteryPlayPanel />
      </div>
    </div>
  );
}
