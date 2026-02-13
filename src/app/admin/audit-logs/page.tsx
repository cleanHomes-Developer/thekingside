import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

type SearchParams = {
  q?: string;
  action?: string;
  entityType?: string;
  userId?: string;
  cursor?: string;
};

function toText(value: unknown) {
  if (!value) {
    return "";
  }
  return String(value);
}

function getSeverity(action: string) {
  const normalized = action.toLowerCase();
  if (
    normalized.includes("payout") ||
    normalized.includes("refund") ||
    normalized.includes("payment")
  ) {
    return "High";
  }
  if (normalized.includes("admin") || normalized.includes("anticheat")) {
    return "Medium";
  }
  return "Low";
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const q = toText(searchParams.q).trim();
  const action = toText(searchParams.action).trim();
  const entityType = toText(searchParams.entityType).trim();
  const userId = toText(searchParams.userId).trim();
  const cursor = toText(searchParams.cursor).trim();

  const where = {
    ...(action
      ? { action: { contains: action, mode: "insensitive" as const } }
      : {}),
    ...(entityType
      ? { entityType: { contains: entityType, mode: "insensitive" as const } }
      : {}),
    ...(userId ? { userId } : {}),
    ...(q
      ? {
          OR: [
            { action: { contains: q, mode: "insensitive" as const } },
            { entityType: { contains: q, mode: "insensitive" as const } },
            { entityId: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 51,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasNext = logs.length > 50;
  const items = hasNext ? logs.slice(0, 50) : logs;
  const nextCursor = hasNext ? items[items.length - 1]?.id : null;

  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (action) query.set("action", action);
  if (entityType) query.set("entityType", entityType);
  if (userId) query.set("userId", userId);

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Admin
          </p>
          <h1 className="text-3xl font-semibold">Audit logs</h1>
          <p className="text-white/60">
            Every money action, admin action, and tournament state transition.
          </p>
          <Link
            href="/admin"
            className="inline-flex text-sm text-cyan-200 hover:text-cyan-100"
          >
            Back to admin
          </Link>
        </header>

        <form className="grid gap-3 rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-6 md:grid-cols-4">
          <input
            name="q"
            placeholder="Search logs"
            defaultValue={q}
            className="rounded-lg border border-white/10 bg-[#0b1426] px-3 py-2 text-sm text-white/80"
          />
          <input
            name="action"
            placeholder="Action"
            defaultValue={action}
            className="rounded-lg border border-white/10 bg-[#0b1426] px-3 py-2 text-sm text-white/80"
          />
          <input
            name="entityType"
            placeholder="Entity type"
            defaultValue={entityType}
            className="rounded-lg border border-white/10 bg-[#0b1426] px-3 py-2 text-sm text-white/80"
          />
          <input
            name="userId"
            placeholder="User ID"
            defaultValue={userId}
            className="rounded-lg border border-white/10 bg-[#0b1426] px-3 py-2 text-sm text-white/80"
          />
          <button
            type="submit"
            className="md:col-span-4 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            Apply filters
          </button>
          <Link
            href={`/api/admin/audit-logs/export?${query.toString()}`}
            className="md:col-span-4 rounded-full border border-white/20 px-4 py-2 text-center text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Export CSV
          </Link>
        </form>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1426]">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-white/40">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-white/50" colSpan={6}>
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                items.map((log) => (
                  <tr key={log.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-xs text-white/50">
                      {log.createdAt.toISOString()}
                    </td>
                    <td className="px-4 py-3 text-white">{log.action}</td>
                    <td className="px-4 py-3 text-xs text-white/60">
                      {getSeverity(log.action)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white/70">{log.entityType}</div>
                      <div className="text-xs text-white/40">{log.entityId}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {log.userId ?? "System"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/audit-logs/${log.id}`}
                        className="text-xs text-cyan-200 hover:text-cyan-100"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {nextCursor ? (
          <div>
            {(() => {
              query.set("cursor", nextCursor);
              return (
                <Link
                  href={`/admin/audit-logs?${query.toString()}`}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-cyan-300"
                >
                  Next page
                </Link>
              );
            })()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
