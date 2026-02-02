import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type SeasonMode = "free" | "paid";

export type PrizeMode = "gift_card" | "cash";

export type SeasonConfig = {
  mode: SeasonMode;
  freePrizePool: number;
  prizeMode: PrizeMode;
  sponsorshipEnabled: boolean;
  sponsorSlots: number;
};

const DEFAULT_FREE_PRIZE_POOL = 100;
const CACHE_TTL_MS = 30 * 1000;

let cachedSeason:
  | {
      value: SeasonConfig;
      fetchedAt: number;
    }
  | null = null;

function parseNumber(value: string | undefined | null, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getSeasonDefaults(): SeasonConfig {
  const rawMode =
    process.env.SEASON_MODE ?? process.env.NEXT_PUBLIC_SEASON_MODE ?? "paid";
  const mode: SeasonMode = rawMode === "free" ? "free" : "paid";
  const rawPrizeMode = process.env.PRIZE_MODE ?? "gift_card";
  const prizeMode: PrizeMode =
    rawPrizeMode === "cash" ? "cash" : "gift_card";
  const sponsorshipEnabled = process.env.SPONSORSHIP_ENABLED === "true";
  const sponsorSlots = parseNumber(process.env.SPONSOR_SLOTS, 4);
  const freePrizePool = parseNumber(
    process.env.FREE_PRIZE_POOL ?? process.env.NEXT_PUBLIC_FREE_PRIZE_POOL,
    DEFAULT_FREE_PRIZE_POOL,
  );
  return { mode, freePrizePool, prizeMode, sponsorshipEnabled, sponsorSlots };
}

export async function getSeasonConfig(): Promise<SeasonConfig> {
  if (cachedSeason && Date.now() - cachedSeason.fetchedAt < CACHE_TTL_MS) {
    return cachedSeason.value;
  }

  const defaults = getSeasonDefaults();
  const config = await prisma.seasonConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      mode: defaults.mode === "free" ? "FREE" : "PAID",
      freePrizePool: new Prisma.Decimal(defaults.freePrizePool),
      prizeMode: defaults.prizeMode === "cash" ? "CASH" : "GIFT_CARD",
      sponsorshipEnabled: defaults.sponsorshipEnabled,
      sponsorSlots: defaults.sponsorSlots,
    },
  });

  const resolved = {
    mode: config.mode === "FREE" ? "free" : "paid",
    freePrizePool: Number(config.freePrizePool),
    prizeMode: config.prizeMode === "CASH" ? "cash" : "gift_card",
    sponsorshipEnabled: config.sponsorshipEnabled,
    sponsorSlots: config.sponsorSlots,
  };
  cachedSeason = { value: resolved, fetchedAt: Date.now() };
  return resolved;
}

export async function setSeasonConfig(
  next: SeasonConfig,
): Promise<SeasonConfig> {
  const updated = await prisma.seasonConfig.upsert({
    where: { id: 1 },
    update: {
      mode: next.mode === "free" ? "FREE" : "PAID",
      freePrizePool: new Prisma.Decimal(next.freePrizePool),
      prizeMode: next.prizeMode === "cash" ? "CASH" : "GIFT_CARD",
      sponsorshipEnabled: next.sponsorshipEnabled,
      sponsorSlots: next.sponsorSlots,
    },
    create: {
      id: 1,
      mode: next.mode === "free" ? "FREE" : "PAID",
      freePrizePool: new Prisma.Decimal(next.freePrizePool),
      prizeMode: next.prizeMode === "cash" ? "CASH" : "GIFT_CARD",
      sponsorshipEnabled: next.sponsorshipEnabled,
      sponsorSlots: next.sponsorSlots,
    },
  });

  const resolved = {
    mode: updated.mode === "FREE" ? "free" : "paid",
    freePrizePool: Number(updated.freePrizePool),
    prizeMode: updated.prizeMode === "CASH" ? "cash" : "gift_card",
    sponsorshipEnabled: updated.sponsorshipEnabled,
    sponsorSlots: updated.sponsorSlots,
  };
  cachedSeason = { value: resolved, fetchedAt: Date.now() };
  return resolved;
}
