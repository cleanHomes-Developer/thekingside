import { z } from "zod";

export const passwordSchema = z.string().min(8).max(72);

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: passwordSchema,
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: passwordSchema,
});

export const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  displayName: z.string().min(1).max(100).optional(),
  age: z.number().int().min(13).max(120).nullable().optional(),
  country: z.string().min(2).max(80).nullable().optional(),
  lichessUsername: z.string().min(2).max(30).nullable().optional(),
  profilePictureUrl: z.string().url().max(500).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
});

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
