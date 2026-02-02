import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function requireUser() {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return null;
  }
  return prisma.user.findUnique({
    where: { id: session.sub },
  });
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}
