import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

function formatJson(value: unknown) {
  if (!value) {
    return "N/A";
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default async function AuditLogDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const log = await prisma.auditLog.findUnique({
    where: { id: params.id },
  });

  if (!log) {
    redirect("/admin/audit-logs");
  }

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Admin
          </p>
          <h1 className="text-3xl font-semibold">Audit log detail</h1>
          <p className="text-white/60">{log.action}</p>
          <Link
            href="/admin/audit-logs"
            className="inline-flex text-sm text-cyan-200 hover:text-cyan-100"
          >
            Back to audit logs
          </Link>
        </header>

        <div className="rounded-2xl border border-white/10 bg-[#0b1426] p-6">
          <div className="grid gap-4 text-sm text-white/70 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Timestamp
              </p>
              <p className="text-white">{log.createdAt.toISOString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                User
              </p>
              <p className="text-white">{log.userId ?? "System"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Entity type
              </p>
              <p className="text-white">{log.entityType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Entity ID
              </p>
              <p className="text-white">{log.entityId ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                IP address
              </p>
              <p className="text-white">{log.ipAddress ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                User agent
              </p>
              <p className="text-white">{log.userAgent ?? "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#0b1426] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Before
            </p>
            <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-white/5 bg-slate-950/50 p-3 text-xs text-white/70">
              {formatJson(log.beforeState)}
            </pre>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b1426] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              After
            </p>
            <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-white/5 bg-slate-950/50 p-3 text-xs text-white/70">
              {formatJson(log.afterState)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
