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
      </div>
    </div>
  );
}
