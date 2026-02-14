import { z } from "zod";

export const lichessGameSchema = z.object({
  status: z.string(),
  winner: z.enum(["white", "black"]).optional(),
});

export type LichessGamePayload = z.infer<typeof lichessGameSchema>;

export function parseLichessGame(payload: unknown) {
  return lichessGameSchema.parse(payload);
}
