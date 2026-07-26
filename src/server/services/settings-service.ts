import { NotFoundError } from "@/server/core/errors";
import { toPublicUser, userRepository } from "@/server/repositories/user-repository";
import type { UpdateProfileInput } from "@/lib/validations/settings";
import type { User } from "@/types/auth";

/** Account self-service use-cases. */
export const settingsService = {
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const record = await userRepository.update(userId, { name: input.name });
    if (!record) throw new NotFoundError("Your account could not be found.");
    return toPublicUser(record);
  },
};
