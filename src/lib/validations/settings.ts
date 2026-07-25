import { z } from "zod";

/**
 * Account settings rules. The password constraints intentionally mirror
 * `validations/auth.ts` so a password set here would also pass registration.
 */

const strongPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Add at least one lowercase letter")
  .regex(/[A-Z]/, "Add at least one uppercase letter")
  .regex(/[0-9]/, "Add at least one number");

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(64, "Name is too long")
    .regex(/^[\p{L}\p{M}\s'.-]+$/u, "Use letters, spaces, apostrophes and hyphens only"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((values) => values.password !== values.currentPassword, {
    path: ["password"],
    message: "Choose a password you have not used here before",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
