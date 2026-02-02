import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import AdminSponsorEditForm from "./AdminSponsorEditForm";

type AdminSponsorPageProps = {
  params: { id: string };
};

export default async function AdminSponsorPage({
  params,
}: AdminSponsorPageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const sponsor = await prisma.sponsor.findUnique({
    where: { id: params.id },
  });

  if (!sponsor) {
    notFound();
  }

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Admin
            </p>
            <h1 className="text-3xl font-semibold">Edit sponsor</h1>
          </div>
          <Link
            href="/admin/sponsors"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to sponsors
          </Link>
        </header>

        <AdminSponsorEditForm
          sponsor={{
            id: sponsor.id,
            name: sponsor.name,
            tier: sponsor.tier,
            logoUrl: sponsor.logoUrl,
            websiteUrl: sponsor.websiteUrl ?? "",
            tagline: sponsor.tagline ?? "",
            active: sponsor.active,
            sortOrder: sponsor.sortOrder.toString(),
            startsAt: sponsor.startsAt?.toISOString() ?? "",
            endsAt: sponsor.endsAt?.toISOString() ?? "",
          }}
        />
      </div>
    </div>
  );
}
