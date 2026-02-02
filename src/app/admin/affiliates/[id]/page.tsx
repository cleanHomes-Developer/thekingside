import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import AdminAffiliateEditForm from "./AdminAffiliateEditForm";

type AdminAffiliatePageProps = {
  params: { id: string };
};

export default async function AdminAffiliatePage({
  params,
}: AdminAffiliatePageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const program = await prisma.affiliateProgram.findUnique({
    where: { id: params.id },
  });

  if (!program) {
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
            <h1 className="text-3xl font-semibold">Edit affiliate</h1>
          </div>
          <Link
            href="/admin/affiliates"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to affiliates
          </Link>
        </header>

        <AdminAffiliateEditForm
          program={{
            id: program.id,
            name: program.name,
            category: program.category,
            commissionType: program.commissionType,
            commissionRange: program.commissionRange,
            cookieDuration: program.cookieDuration,
            notes: program.notes ?? "",
            affiliateUrl: program.affiliateUrl,
            enabled: program.enabled,
            sortOrder: program.sortOrder.toString(),
          }}
        />
      </div>
    </div>
  );
}
