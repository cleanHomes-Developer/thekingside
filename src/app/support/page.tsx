import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import SupportForm from "./SupportForm";

export default async function SupportPage() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: "desc" },
    take: 20,
    select: { id: true, name: true },
  });

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Support
            </p>
            <h1 className="text-3xl font-semibold">Get help fast</h1>
            <p className="text-white/60">
              File a ticket and track the status in one place.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to dashboard
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <SupportForm tournaments={tournaments} />

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Recent tickets
            </h2>
            {tickets.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">
                No tickets submitted yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-white/70">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/support/${ticket.id}`}
                    className="block rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 transition hover:border-cyan-300/60"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      {ticket.status}
                    </p>
                    <p className="text-base font-semibold text-white">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-white/40">
                      {ticket.createdAt.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
