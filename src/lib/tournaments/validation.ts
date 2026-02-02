import { z } from "zod";

const tournamentTypeValues = [
  "QUALIFIER",
  "SEMIFINAL",
  "WILDCARD",
  "FINAL",
] as const;

const tournamentStatusValues = [
  "REGISTRATION",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

const tournamentBaseSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(tournamentTypeValues),
  entryFee: z.coerce.number().min(0),
  minPlayers: z.coerce.number().int().min(2).default(8),
  maxPlayers: z.coerce.number().int().min(2),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  timeControl: z.string().max(50).nullable().optional(),
  seriesKey: z.string().max(80).nullable().optional(),
  slotKey: z.string().max(80).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
});

export const tournamentCreateSchema = tournamentBaseSchema.refine(
  (value) => value.maxPlayers >= value.minPlayers,
  {
    message: "maxPlayers must be greater than or equal to minPlayers",
    path: ["maxPlayers"],
  },
);

export const tournamentUpdateSchema = tournamentBaseSchema
  .partial()
  .refine(
    (value) => {
      if (value.maxPlayers && value.minPlayers) {
        return value.maxPlayers >= value.minPlayers;
      }
      return true;
    },
    {
      message: "maxPlayers must be greater than or equal to minPlayers",
      path: ["maxPlayers"],
    },
  );

export const tournamentStatusSchema = z.enum(tournamentStatusValues);

export function normalizeTournamentInput(payload: Record<string, unknown>) {
  const normalized = { ...payload } as Record<string, unknown>;
  for (const key of ["endDate", "timeControl", "seriesKey", "slotKey", "description"]) {
    if (normalized[key] === "") {
      normalized[key] = null;
    }
  }
  return normalized;
}

export function computeLockAt(startDate: Date) {
  const lockAt = new Date(startDate);
  lockAt.setMinutes(lockAt.getMinutes() - 2);
  return lockAt;
}
