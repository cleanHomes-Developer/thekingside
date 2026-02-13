import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { ensureMasterySeeded } from "@/lib/mastery/seed";
import { levelFromXp } from "@/lib/mastery/taxonomy";

const GUEST_COOKIE = "tks_guest";

async function getPlayer() {
  const session = await getSessionFromCookies();
  if (session?.sub) {
    return prisma.casualPlayer.findUnique({ where: { userId: session.sub } });
  }
  const guestKey = cookies().get(GUEST_COOKIE)?.value;
  if (!guestKey) {
    return null;
  }
  return prisma.casualPlayer.findUnique({ where: { guestKey } });
}

export async function GET(request: NextRequest) {
  await ensureMasterySeeded();
  const includeRating =
    request.nextUrl.searchParams.get("includeRating") === "1";
  const player = await getPlayer();
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 401 });
  }

  const [categories, skills, playerSkills, feedback] = await Promise.all([
    prisma.masteryCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.masterySkill.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.masteryPlayerSkill.findMany({
      where: { playerId: player.id },
    }),
    prisma.masteryFeedback.findFirst({
      where: { playerId: player.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const skillProgress = new Map(
    playerSkills.map((row) => {
      const state = levelFromXp(row.xp);
      return [
        row.skillId,
        {
          xp: row.xp,
          level: row.level,
          progress: state.progress,
          needed: state.needed,
        },
      ];
    }),
  );

  const grouped = categories.map((category) => ({
    id: category.id,
    key: category.key,
    name: category.name,
    description: category.description,
    skills: skills
      .filter((skill) => skill.categoryId === category.id)
      .map((skill) => {
        const progress = skillProgress.get(skill.id) ?? {
          xp: 0,
          level: 0,
          progress: 0,
          needed: 120,
        };
        return {
          id: skill.id,
          key: skill.key,
          name: skill.name,
          description: skill.description,
          maxLevel: skill.maxLevel,
          ...progress,
        };
      }),
  }));

  const recommendations = feedback?.recommendations ?? [];

  return NextResponse.json({
    player: {
      id: player.id,
      displayName: player.displayName,
      rating: includeRating ? player.rating : null,
    },
    categories: grouped,
    feedback: feedback
      ? {
          summary: feedback.summary,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
          recommendations,
        }
      : null,
  });
}
