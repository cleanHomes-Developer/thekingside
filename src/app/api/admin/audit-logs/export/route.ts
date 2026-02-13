import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").trim();
  const action = (params.get("action") ?? "").trim();
  const entityType = (params.get("entityType") ?? "").trim();
  const userId = (params.get("userId") ?? "").trim();

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
    take: 2000,
  });

  const rows = [
    ["time", "action", "entityType", "entityId", "userId", "ipAddress"].join(","),
    ...logs.map((log) =>
      [
        log.createdAt.toISOString(),
        JSON.stringify(log.action),
        JSON.stringify(log.entityType),
        JSON.stringify(log.entityId ?? ""),
        JSON.stringify(log.userId ?? "system"),
        JSON.stringify(log.ipAddress ?? ""),
      ].join(","),
    ),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=audit-logs.csv",
    },
  });
}
