import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(64, "Name is too long")
    .regex(/^[\p{L}\p{M}\s'.-]+$/u, "Use letters, spaces, apostrophes and hyphens only"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
