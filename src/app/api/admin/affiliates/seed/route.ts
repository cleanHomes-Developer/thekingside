import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { seedAffiliatePrograms } from "@/lib/affiliates/programs";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.affiliateProgram.count();
  if (existing > 0) {
    return NextResponse.json(
      { error: "Affiliate programs already seeded." },
      { status: 400 },
    );
  }

  const requestMeta = getRequestMeta(request);
  const created = await prisma.$transaction(async (tx) => {
    const records = await Promise.all(
      seedAffiliatePrograms.map((program, index) =>
        tx.affiliateProgram.create({
          data: {
            name: program.name,
            category: program.category,
            commissionType: program.commissionType,
            commissionRange: program.commissionRange,
            cookieDuration: program.cookieDuration,
            notes: program.notes ?? undefined,
            affiliateUrl: "https://example.com",
            enabled: false,
            sortOrder: index,
          },
        }),
      ),
    );
    await logAuditEvent(tx, {
      action: "AFFILIATE_SEED",
      userId: admin.id,
      entityType: "AffiliateProgram",
      entityId: null,
      beforeState: { count: 0 },
      afterState: { count: records.length },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
    return records.length;
  });

  return NextResponse.json({ count: created }, { status: 201 });
}
