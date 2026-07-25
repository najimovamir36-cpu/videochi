import { NotFoundError, ValidationError } from "@/server/core/errors";
import { toPublicUser, userRepository } from "@/server/repositories/user-repository";
import { hashPassword, verifyPassword } from "@/server/security/password";
import type { ChangePasswordInput, UpdateProfileInput } from "@/lib/validations/settings";
import type { User } from "@/types/auth";

/** Account self-service use-cases. */
export const settingsService = {
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const record = await userRepository.update(userId, { name: input.name });
    if (!record) throw new NotFoundError("Your account could not be found.");
    return toPublicUser(record);
  },

  async changePassword(userId: string, input: ChangePasswordInput): Promise<User> {
    const record = await userRepository.findById(userId);
    if (!record) throw new NotFoundError("Your account could not be found.");

    const valid = await verifyPassword(input.currentPassword, record.passwordHash);
    if (!valid) {
      // Reported against the field so the form highlights the right input.
      throw new ValidationError({ currentPassword: "That is not your current password." });
    }

    const updated = await userRepository.update(userId, {
      passwordHash: await hashPassword(input.password),
    });
    if (!updated) throw new NotFoundError("Your account could not be found.");

    return toPublicUser(updated);
  },
};
