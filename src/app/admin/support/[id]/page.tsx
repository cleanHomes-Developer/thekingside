import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import AdminSupportDetailActions from "./AdminSupportDetailActions";

type AdminSupportDetailPageProps = {
  params: { id: string };
};

export default async function AdminSupportDetailPage({
  params,
}: AdminSupportDetailPageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: { user: true, tournament: true },
  });

  if (!ticket) {
    notFound();
  }

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Support ticket
            </p>
            <h1 className="text-3xl font-semibold">{ticket.subject}</h1>
            <p className="text-white/60">
              {ticket.status} - {ticket.user.displayName}
            </p>
          </div>
          <Link
            href="/admin/support"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to tickets
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Description
            </p>
            <p className="mt-3 whitespace-pre-wrap">{ticket.description}</p>
            <div className="mt-4 space-y-2 text-xs text-white/50">
              <p>User email: {ticket.user.email}</p>
              <p>
                Tournament: {ticket.tournament?.name ?? "General"}
              </p>
              <p>Created: {ticket.createdAt.toLocaleString()}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-base font-semibold text-cyan-200">
              Admin actions
            </h2>
            <div className="mt-4">
              <AdminSupportDetailActions
                ticketId={ticket.id}
                initialStatus={ticket.status}
                initialNotes={ticket.adminNotes}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
