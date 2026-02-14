import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/format";

export const revalidate = 30;

const CHART_DAYS = 17;
const SEASON_DAYS = 30;

type ChartPoint = {
  label: string;
  value: number;
};

function buildChartPoints(entries: { createdAt: Date; amount: number }[]) {
  const points: ChartPoint[] = [];
  const totals = new Map<string, number>();
  const today = new Date();

  for (let i = CHART_DAYS - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    totals.set(key, 0);
  }

  for (const entry of entries) {
    const key = entry.createdAt.toISOString().slice(0, 10);
    if (!totals.has(key)) {
      continue;
    }
    totals.set(key, (totals.get(key) ?? 0) + entry.amount);
  }

  let index = 1;
  for (const [_, value] of totals.entries()) {
    points.push({ label: `Day ${index}`, value });
    index += 1;
  }

  return points;
}

function buildLinePath(points: ChartPoint[]) {
  if (points.length === 0) {
    return "";
  }
  const max = Math.max(...points.map((point) => point.value), 1);
  const min = Math.min(...points.map((point) => point.value), 0);
  const range = max - min || 1;
  const height = 120;
  const width = 600;

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1 || 1)) * width;
      const normalized = (point.value - min) / range;
      const y = height - normalized * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default async function AdminStatsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const [usersCount, entriesCount, payoutsPending, tournamentCompleted] =
    await Promise.all([
      prisma.user.count(),
      prisma.entry.count(),
      prisma.payout.count({ where: { status: "PENDING" } }),
      prisma.tournament.count({ where: { status: "COMPLETED" } }),
    ]);

  const uniquePlayers = await prisma.entry.findMany({
    distinct: ["userId"],
    select: { userId: true },
  });

  const totalPrizePool = await prisma.tournament.aggregate({
    _sum: { prizePool: true },
  });

  const totalLedger = await prisma.prizePoolLedger.aggregate({
    _sum: { amount: true },
  });

  const [platformFees, stripeFees] = await Promise.all([
    prisma.prizePoolLedger.aggregate({
      _sum: { amount: true },
      where: { type: "PLATFORM_FEE" },
    }),
    prisma.prizePoolLedger.aggregate({
      _sum: { amount: true },
      where: { type: "STRIPE_FEE" },
    }),
  ]);
  const adminProfit =
    (platformFees._sum.amount ? Number(platformFees._sum.amount) : 0) +
    (stripeFees._sum.amount ? Number(stripeFees._sum.amount) : 0);

  const entryRevenue = await prisma.prizePoolLedger.findMany({
    where: { type: "ENTRY_FEE" },
    select: { createdAt: true, amount: true },
    orderBy: { createdAt: "asc" },
  });

  const chartPoints = buildChartPoints(
    entryRevenue.map((entry) => ({
      createdAt: entry.createdAt,
      amount: Number(entry.amount),
    })),
  );
  const chartPath = buildLinePath(chartPoints);
  const avgRevenue =
    chartPoints.reduce((sum, point) => sum + point.value, 0) /
    (chartPoints.length || 1);
  const projectedTotal = avgRevenue * SEASON_DAYS;

  const flaggedCases = await prisma.antiCheatCase.findMany({
    where: { riskLevel: "HIGH" },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-[#070b16] px-6 py-14 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Admin
            </p>
            <h1 className="text-3xl font-semibold">Platform stats</h1>
            <p className="text-white/60">
              Revenue, activity, and compliance snapshots.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300 hover:text-white"
          >
            Back to admin
          </Link>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total revenue",
              value: formatCurrency(
                totalLedger._sum.amount?.toString() ?? "0",
              ),
            },
            { label: "Players registered", value: entriesCount.toString() },
            { label: "Unique players", value: uniquePlayers.length.toString() },
            {
              label: "Days completed",
              value: `${Math.min(tournamentCompleted, SEASON_DAYS)}/${SEASON_DAYS}`,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-cyan-400/20 bg-[#0a111f]/80 p-5 shadow-[0_0_20px_rgba(0,217,255,0.12)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-cyan-100">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-cyan-400/20 bg-[#0a111f]/80 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Financial summary
              </p>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <p>
                  Admin profit: {formatCurrency(adminProfit.toString())}
                </p>
                <p>
                  Prize escrow: {formatCurrency(
                    totalPrizePool._sum.prizePool?.toString() ?? "0",
                  )}
                </p>
                <p>Payout status: {payoutsPending} pending</p>
              </div>
            </div>
            <Link
              href="/admin/payouts"
              className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              Process payout
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-400/20 bg-[#0a111f]/80 p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Daily revenue chart
            </p>
            <p className="text-xs text-white/50">
              Avg daily revenue: {formatCurrency(avgRevenue.toFixed(2))} | Projected total: {formatCurrency(projectedTotal.toFixed(2))}
            </p>
          </div>
          {chartPoints.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">
              No revenue data yet.
            </p>
          ) : (
            <div className="mt-4">
              <svg
                viewBox="0 0 600 140"
                className="h-36 w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <path
                  d={chartPath}
                  fill="none"
                  stroke="url(#chartGlow)"
                  strokeWidth="3"
                />
              </svg>
              <div className="mt-2 flex justify-between text-[10px] text-white/40">
                {chartPoints.map((point, index) =>
                  index % 4 === 0 ? <span key={point.label}>{point.label}</span> : <span key={point.label} />,
                )}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-cyan-400/20 bg-[#0a111f]/80 p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Flagged games for review
            </p>
            <Link
              href="/admin/anticheat"
              className="text-xs text-cyan-200 hover:text-cyan-100"
            >
              View all
            </Link>
          </div>
          {flaggedCases.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">
              No high risk cases.
            </p>
          ) : (
            <div className="mt-4 space-y-2 text-xs text-white/70">
              {flaggedCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      {caseItem.user.displayName}
                    </p>
                    <p className="text-sm text-white/80">High risk</p>
                  </div>
                  <Link
                    href={`/admin/anticheat/${caseItem.id}`}
                    className="rounded-full border border-cyan-300/40 px-3 py-1 text-xs text-cyan-100"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
