import { ConflictError, UnauthorizedError } from "@/server/core/errors";
import { env } from "@/server/core/env";
import { DEMO_ACCOUNT } from "@/server/db/seed";
import { sendMail } from "@/server/mail/mailer";
import { passwordResetEmail } from "@/server/mail/templates";
import { usageRepository } from "@/server/repositories/media-repository";
import {
  passwordResetRepository,
  toPublicUser,
  userRepository,
} from "@/server/repositories/user-repository";
import { randomToken } from "@/server/security/crypto";
import { hashPassword, needsRehash, verifyPassword } from "@/server/security/password";
import type { ForgotPasswordInput, LoginInput, RegisterInput } from "@/lib/validations/auth";
import type { OAuthProfile } from "@/server/services/oauth-service";
import type { User, UserRecord } from "@/types/auth";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

/**
 * Authentication use-cases. Deliberately free of HTTP concerns — the route
 * handlers translate these results into responses and cookies.
 */
export const authService = {
  async register(input: RegisterInput): Promise<User> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with that email already exists.");
    }

    const record = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      plan: "free",
      role: "owner",
    });
    await usageRepository.createDefault(record.id);

    return toPublicUser(record);
  },

  async login(input: LoginInput): Promise<User> {
    const record = await userRepository.findByEmail(input.email);

    // Uniform failure message so the endpoint cannot be used to enumerate accounts.
    const invalid = new UnauthorizedError("Email or password is incorrect.");
    if (!record) throw invalid;

    const valid = await verifyPassword(input.password, record.passwordHash);
    if (!valid) throw invalid;

    if (needsRehash(record.passwordHash)) {
      await userRepository.update(record.id, {
        passwordHash: await hashPassword(input.password),
      });
    }

    return toPublicUser(record);
  },

  /**
   * Always resolves so the response cannot reveal whether an email is
   * registered. Returns the reset token only outside production, where there is
   * no mail transport wired up yet.
   */
  async requestPasswordReset(input: ForgotPasswordInput): Promise<{ token: string | null }> {
    const record = await userRepository.findByEmail(input.email);
    if (!record) return { token: null };

    const token = randomToken(32);
    await passwordResetRepository.create(record.id, token, RESET_TOKEN_TTL_MS);

    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
    // Failure to send must not reveal that the account exists, nor 500 the
    // request — log and continue so the response stays uniform.
    try {
      await sendMail(passwordResetEmail({ to: record.email, name: record.name, resetUrl }));
    } catch (error) {
      console.error("[auth] failed to send password reset email", error);
    }

    // The token is echoed back only outside production, as a developer
    // convenience when no real mailbox is receiving the message.
    return { token: process.env.NODE_ENV === "production" ? null : token };
  },

  async resetPassword(token: string, password: string): Promise<User> {
    const userId = await passwordResetRepository.consume(token);
    if (!userId) throw new UnauthorizedError("This reset link is invalid or has expired.");

    const record = await userRepository.update(userId, {
      passwordHash: await hashPassword(password),
    });
    if (!record) throw new UnauthorizedError("This reset link is invalid or has expired.");

    return toPublicUser(record);
  },

  /** Credentials shown on the sign-in screen for reviewers and demos. */
  getDemoCredentials() {
    return { email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password };
  },

  /**
   * Signs in with a verified OAuth profile, creating the account on first
   * sign-in or linking to an existing email/password account of the same
   * email on subsequent ones — so a user can freely switch between "sign in
   * with Google" and email+password for the same account.
   */
  async continueWithOAuthProfile(profile: OAuthProfile): Promise<User> {
    const existing = await userRepository.findByEmail(profile.email);
    if (existing) {
      const patch: Partial<UserRecord> = {};
      if (profile.emailVerified && !existing.emailVerified) patch.emailVerified = true;
      if (profile.avatarUrl && !existing.avatarUrl) patch.avatarUrl = profile.avatarUrl;

      const record =
        Object.keys(patch).length > 0
          ? ((await userRepository.update(existing.id, patch)) ?? existing)
          : existing;
      return toPublicUser(record);
    }

    // OAuth accounts have no password of their own; a random, never-surfaced
    // hash satisfies the column without creating a usable credential.
    let record = await userRepository.create({
      name: profile.name,
      email: profile.email,
      passwordHash: await hashPassword(randomToken(32)),
      plan: "free",
      role: "owner",
    });
    if (profile.avatarUrl || profile.emailVerified) {
      record =
        (await userRepository.update(record.id, {
          ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
          ...(profile.emailVerified ? { emailVerified: true } : {}),
        })) ?? record;
    }
    await usageRepository.createDefault(record.id);

    return toPublicUser(record);
  },
};
