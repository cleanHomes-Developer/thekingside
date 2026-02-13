import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { profileSchema } from "@/lib/auth/validation";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

function normalizeProfilePayload(payload: Record<string, unknown>) {
  const normalized = { ...payload } as Record<string, unknown>;
  if ("age" in normalized) {
    if (normalized.age === "" || normalized.age === null) {
      normalized.age = null;
    } else {
      const value = Number(normalized.age);
      normalized.age = Number.isNaN(value) ? normalized.age : value;
    }
  }
  for (const key of [
    "country",
    "lichessUsername",
    "profilePictureUrl",
    "bio",
  ]) {
    if (normalized[key] === "") {
      normalized[key] = null;
    }
  }
  return normalized;
}

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { profile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      role: user.role,
      profile: user.profile,
    },
  });
}

export async function PUT(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const normalized = normalizeProfilePayload(
    payload as Record<string, unknown>,
  );
  const parsed = profileSchema.safeParse(normalized);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, displayName, ...profileData } = parsed.data;
  const requestMeta = getRequestMeta(request);
  const updatedUser = await prisma.$transaction(async (tx) => {
    const beforeUser = await tx.user.findUnique({
      where: { id: session.sub },
      include: { profile: true },
    });
    if (!beforeUser) {
      return null;
    }

    const user = await tx.user.update({
      where: { id: session.sub },
      data: {
        ...(name ? { name } : {}),
        ...(displayName ? { displayName } : {}),
      },
    });

    const profile = await tx.profile.upsert({
      where: { userId: session.sub },
      create: {
        userId: session.sub,
        ...profileData,
      },
      update: {
        ...profileData,
      },
    });

    await logAuditEvent(tx, {
      action: "PROFILE_UPDATE",
      userId: session.sub,
      entityType: "UserProfile",
      entityId: session.sub,
      beforeState: {
        name: beforeUser.name,
        displayName: beforeUser.displayName,
        profile: beforeUser.profile
          ? {
              country: beforeUser.profile.country,
              lichessUsername: beforeUser.profile.lichessUsername,
              profilePictureUrl: beforeUser.profile.profilePictureUrl,
              bio: beforeUser.profile.bio,
              age: beforeUser.profile.age,
            }
          : null,
      },
      afterState: {
        name: user.name,
        displayName: user.displayName,
        profile: {
          country: profile.country,
          lichessUsername: profile.lichessUsername,
          profilePictureUrl: profile.profilePictureUrl,
          bio: profile.bio,
          age: profile.age,
        },
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return user;
  });

  if (!updatedUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      displayName: updatedUser.displayName,
      role: updatedUser.role,
    },
  });
}
