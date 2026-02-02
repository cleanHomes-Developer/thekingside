import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import AdminTournamentEditForm from "./AdminTournamentEditForm";
import { getSeasonConfig } from "@/lib/season";

type AdminTournamentPageProps = {
  params: { id: string };
};

export default async function AdminTournamentPage({
  params,
}: AdminTournamentPageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
  });

  if (!tournament) {
    notFound();
  }
  const season = await getSeasonConfig();

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Admin
            </p>
            <h1 className="text-3xl font-semibold">Edit tournament</h1>
          </div>
          <Link
            href="/admin/tournaments"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to list
          </Link>
        </header>

        <AdminTournamentEditForm
          isFreeSeason={season.mode === "free"}
          freePrizePool={season.freePrizePool}
          tournament={{
            id: tournament.id,
            name: tournament.name,
            type: tournament.type,
            entryFee: tournament.entryFee.toString(),
            minPlayers: tournament.minPlayers.toString(),
            maxPlayers: tournament.maxPlayers.toString(),
            startDate: tournament.startDate.toISOString(),
            endDate: tournament.endDate?.toISOString() ?? "",
            timeControl: tournament.timeControl ?? "",
            seriesKey: tournament.seriesKey ?? "",
            slotKey: tournament.slotKey ?? "",
            description: tournament.description ?? "",
          }}
        />
      </div>
    </div>
  );
}
