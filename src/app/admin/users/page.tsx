import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import UserActions from "./UserActions";

type SearchParams = {
  page?: string;
  q?: string;
  role?: string;
  kyc?: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const page = Math.max(Number(searchParams?.page ?? "1") || 1, 1);
  const pageSize = 25;
  const skip = (page - 1) * pageSize;
  const q = (searchParams?.q ?? "").trim();
  const roleFilter = (searchParams?.role ?? "ALL").toUpperCase();
  const kycFilter = (searchParams?.kyc ?? "ALL").toUpperCase();

  const where: Record<string, unknown> = {
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { displayName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(roleFilter !== "ALL" ? { role: roleFilter } : {}),
    ...(kycFilter !== "ALL"
      ? kycFilter === "PENDING"
        ? {
            OR: [
              { profile: { is: null } },
              { profile: { is: { kycStatus: "PENDING" } } },
            ],
          }
        : { profile: { is: { kycStatus: kycFilter } } }
      : {}),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: { profile: true },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (roleFilter && roleFilter !== "ALL") query.set("role", roleFilter);
  if (kycFilter && kycFilter !== "ALL") query.set("kyc", kycFilter);

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Admin
          </p>
          <h1 className="text-3xl font-semibold">Users</h1>
          <p className="text-white/60">Search, filter, and manage accounts.</p>
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
            placeholder="Search name or email"
            defaultValue={q}
            className="rounded-lg border border-white/10 bg-[#0b1426] px-3 py-2 text-sm text-white/80"
          />
          <select
            name="role"
            defaultValue={roleFilter}
            className="rounded-lg border border-white/10 bg-[#0b1426] px-3 py-2 text-sm text-white/80"
          >
            <option value="ALL">All roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            name="kyc"
            defaultValue={kycFilter}
            className="rounded-lg border border-white/10 bg-[#0b1426] px-3 py-2 text-sm text-white/80"
          >
            <option value="ALL">All KYC</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            Apply filters
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1426]">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-white/40">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">KYC</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-white/50" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-white">
                      {user.displayName || user.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-white/70">{user.email}</td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {user.role}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {user.profile?.kycStatus ?? "PENDING"}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {user.createdAt.toISOString()}
                    </td>
                    <td className="px-4 py-3">
                      <UserActions
                        userId={user.id}
                        email={user.email}
                        kycStatus={user.profile?.kycStatus ?? "PENDING"}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Link
                href={`/admin/users?page=${Math.max(page - 1, 1)}&${query.toString()}`}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  page === 1
                    ? "border-white/10 text-white/30 pointer-events-none"
                    : "border-white/20 text-white/80 hover:border-cyan-300"
                }`}
              >
                Previous
              </Link>
              <Link
                href={`/admin/users?page=${Math.min(page + 1, totalPages)}&${query.toString()}`}
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
