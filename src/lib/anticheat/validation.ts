import { z } from "zod";

const riskLevels = ["LOW", "MEDIUM", "HIGH"] as const;

export const reportSchema = z.object({
  tournamentId: z.string().uuid(),
  matchId: z.string().uuid().nullable().optional(),
  riskLevel: z.enum(riskLevels).optional(),
  evidence: z.record(z.unknown()),
  description: z.string().max(1000).optional(),
});

export const appealSchema = z.object({
  appealText: z.string().min(10).max(2000),
});

export const resolveSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]),
  adminNotes: z.string().max(2000).optional(),
});
