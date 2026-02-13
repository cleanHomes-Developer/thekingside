import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminAnnouncementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const announcement = await prisma.adminAnnouncement.findUnique({
    where: { id: params.id },
    include: {
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: 200,
      },
    },
  });

  if (!announcement) {
    redirect("/admin/announcements");
  }

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Admin
          </p>
          <h1 className="text-3xl font-semibold">{announcement.title}</h1>
          <p className="text-white/60">
            {announcement.subject} | {announcement.audience} |{" "}
            {announcement.status}
          </p>
          <Link
            href="/admin/announcements"
            className="inline-flex text-sm text-cyan-200 hover:text-cyan-100"
          >
            Back to announcements
          </Link>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#0b1426] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Message
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">
            {announcement.body}
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0b1426] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Delivery log
          </p>
          {announcement.deliveries.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">
              No deliveries recorded yet.
            </p>
          ) : (
            <div className="mt-4 space-y-2 text-xs text-white/70">
              {announcement.deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                >
                  <div>
                    <p className="text-white">{delivery.email}</p>
                    <p className="text-[10px] text-white/40">
                      {delivery.userId ?? "Guest"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      {delivery.status}
                    </p>
                    {delivery.error ? (
                      <p className="text-[10px] text-rose-200">
                        {delivery.error}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
