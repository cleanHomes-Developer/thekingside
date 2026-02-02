import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

type SupportTicketPageProps = {
  params: { id: string };
};

export default async function SupportTicketPage({
  params,
}: SupportTicketPageProps) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: { tournament: true },
  });

  if (!ticket || ticket.userId !== user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Support ticket
            </p>
            <h1 className="text-3xl font-semibold">{ticket.subject}</h1>
            <p className="text-white/60">Status: {ticket.status}</p>
          </div>
          <Link
            href="/support"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to support
          </Link>
        </header>

        <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-sm text-white/70">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Details
          </p>
          <p className="mt-3 whitespace-pre-wrap">{ticket.description}</p>
          {ticket.tournament ? (
            <p className="mt-4 text-xs text-white/50">
              Tournament: {ticket.tournament.name}
            </p>
          ) : null}
        </div>

        {ticket.adminNotes ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Admin notes
            </p>
            <p className="mt-3 whitespace-pre-wrap">{ticket.adminNotes}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
