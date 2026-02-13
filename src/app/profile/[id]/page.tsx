import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type ProfilePageProps = {
  params: { id: string };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { profile: true },
  });

  if (!user) {
    notFound();
  }

  const recentMatches = await prisma.match.findMany({
    where: {
      status: "COMPLETED",
      OR: [{ player1Id: user.id }, { player2Id: user.id }],
    },
    orderBy: { completedAt: "desc" },
    take: 5,
    include: { tournament: true },
  });

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Player profile
          </p>
          <h1 className="text-3xl font-semibold">{user.displayName}</h1>
          <p className="text-white/60">{user.profile?.bio ?? "No bio yet."}</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-sm text-white/70">
          <div className="grid gap-4 md:grid-cols-2">
            <p>
              <span className="text-white/50">Name:</span> {user.name}
            </p>
            <p>
              <span className="text-white/50">Country:</span>{" "}
              {user.profile?.country ?? "Not set"}
            </p>
            <p>
              <span className="text-white/50">Lichess:</span>{" "}
              {user.profile?.lichessUsername ?? "Not linked"}
            </p>
            <p>
              <span className="text-white/50">Member since:</span>{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
          <h2 className="text-base font-semibold text-cyan-200">
            Recent games
          </h2>
          {recentMatches.length === 0 ? (
            <p className="mt-3 text-sm text-white/60">No completed games yet.</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-white/70">
              {recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      {match.tournament.name}
                    </p>
                    <p className="text-sm text-white/80">
                      Result: {match.result ?? "Completed"}
                    </p>
                  </div>
                  <p className="text-xs text-white/40">
                    {match.completedAt
                      ? new Date(match.completedAt).toLocaleString()
                      : "Completed"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
