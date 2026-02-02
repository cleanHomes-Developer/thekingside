import { prisma } from "@/lib/db";
import { MASTERY_CATEGORIES, MASTERY_SKILLS } from "@/lib/mastery/taxonomy";

export async function ensureMasterySeeded() {
  const existing = await prisma.masteryCategory.findFirst();
  if (existing) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const category of MASTERY_CATEGORIES) {
      await tx.masteryCategory.create({
        data: {
          key: category.key,
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
        },
      });
    }

    const categories = await tx.masteryCategory.findMany();
    const categoryMap = new Map(categories.map((c) => [c.key, c.id]));

    for (const skill of MASTERY_SKILLS) {
      const categoryId = categoryMap.get(skill.categoryKey);
      if (!categoryId) {
        continue;
      }
      await tx.masterySkill.create({
        data: {
          key: skill.key,
          categoryId,
          name: skill.name,
          description: skill.description,
          sortOrder: skill.sortOrder,
        },
      });
    }
  });
}
