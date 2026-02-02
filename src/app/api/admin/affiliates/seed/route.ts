import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { seedAffiliatePrograms } from "@/lib/affiliates/programs";

export async function POST() {
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
    return records.length;
  });

  return NextResponse.json({ count: created }, { status: 201 });
}
