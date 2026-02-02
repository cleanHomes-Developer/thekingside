import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function getCurrentUserWithProfile() {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return null;
  }
  return prisma.user.findUnique({
    where: { id: session.sub },
    include: { profile: true },
  });
}
