import { UnauthorizedError } from "@/server/core/errors";
import { env } from "@/server/core/env";
import { usageRepository } from "@/server/repositories/media-repository";
import { toPublicUser, userRepository } from "@/server/repositories/user-repository";
import { createId } from "@/lib/utils";
import { randomToken, timingSafeEqual } from "@/server/security/crypto";
import { hashPassword } from "@/server/security/password";
import type { User } from "@/types/auth";

/**
 * The whole app sits behind one shared secret — there is no per-user
 * password, registration form, or social sign-in. Entering the correct
 * passphrase always creates a brand new, blank workspace; middleware already
 * redirects anyone with a valid session away from the passphrase screen, so
 * reaching this code path means the visitor is signed out.
 */
export const authService = {
  async enterWithPassphrase(passphrase: string): Promise<User> {
    if (!env.SITE_PASSPHRASE || !timingSafeEqual(passphrase, env.SITE_PASSPHRASE)) {
      throw new UnauthorizedError("That passphrase is not correct.");
    }

    const id = createId("guest");
    // A random, never-surfaced hash satisfies the NOT NULL column — nobody
    // signs in with a per-account password in this app.
    const record = await userRepository.create({
      name: `Guest ${id.slice(-6)}`,
      email: `${id}@guests.clipmind.local`,
      passwordHash: await hashPassword(randomToken(32)),
      plan: "free",
      role: "owner",
    });
    await usageRepository.createDefault(record.id);

    return toPublicUser(record);
  },
};
