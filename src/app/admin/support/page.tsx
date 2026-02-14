import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import AdminSupportTable from "./AdminSupportTable";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const page = Math.max(Number(searchParams?.page ?? "1") || 1, 1);
  const pageSize = 25;
  const skip = (page - 1) * pageSize;
  const [tickets, total] = await prisma.$transaction([
    prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, tournament: true },
      skip,
      take: pageSize,
    }),
    prisma.supportTicket.count(),
  ]);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Admin
            </p>
            <h1 className="text-3xl font-semibold">Support tickets</h1>
            <p className="text-white/60">
              Triage, respond, and track player support.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to admin
          </Link>
        </header>

        <div className="rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6">
          <AdminSupportTable
            tickets={tickets.map((ticket) => ({
              id: ticket.id,
              userDisplayName: ticket.user.displayName,
              tournamentName: ticket.tournament?.name ?? null,
              subject: ticket.subject,
              status: ticket.status,
              createdAt: ticket.createdAt.toISOString(),
            }))}
          />
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Link
                href={`/admin/support?page=${Math.max(page - 1, 1)}`}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  page === 1
                    ? "border-white/10 text-white/30 pointer-events-none"
                    : "border-white/20 text-white/80 hover:border-cyan-300"
                }`}
              >
                Previous
              </Link>
              <Link
                href={`/admin/support?page=${Math.min(page + 1, totalPages)}`}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  page === totalPages
                    ? "border-white/10 text-white/30 pointer-events-none"
                    : "border-white/20 text-white/80 hover:border-cyan-300"
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
