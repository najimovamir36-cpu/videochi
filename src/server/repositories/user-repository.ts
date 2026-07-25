import { prisma } from "@/server/db/client";
import { mapUser } from "@/server/db/mappers";
import { ensureSeeded } from "@/server/db/seed";
import { createId } from "@/lib/utils";
import type { PlanId, User, UserRecord, UserRole } from "@/types/auth";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  plan?: PlanId;
}

/** Strips secrets before a record crosses the service boundary. */
export function toPublicUser(record: UserRecord): User {
  const { passwordHash: _passwordHash, ...user } = record;
  return user;
}

export const userRepository = {
  async findById(id: string): Promise<UserRecord | null> {
    await ensureSeeded();
    const row = await prisma.user.findUnique({ where: { id } });
    return row ? mapUser(row) : null;
  },

  async findByEmail(email: string): Promise<UserRecord | null> {
    await ensureSeeded();
    const row = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    return row ? mapUser(row) : null;
  },

  async create(input: CreateUserInput): Promise<UserRecord> {
    await ensureSeeded();
    const row = await prisma.user.create({
      data: {
        id: createId("usr"),
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        avatarUrl: null,
        role: input.role ?? "owner",
        plan: input.plan ?? "free",
        emailVerified: false,
        passwordHash: input.passwordHash,
      },
    });
    return mapUser(row);
  },

  async update(id: string, patch: Partial<Omit<UserRecord, "id">>): Promise<UserRecord | null> {
    await ensureSeeded();
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return null;
    const row = await prisma.user.update({ where: { id }, data: patch });
    return mapUser(row);
  },

  async count(): Promise<number> {
    await ensureSeeded();
    return prisma.user.count();
  },
};

export const passwordResetRepository = {
  async create(userId: string, token: string, ttlMs: number): Promise<void> {
    await ensureSeeded();
    await prisma.passwordResetToken.create({
      data: { token, userId, expiresAt: new Date(Date.now() + ttlMs) },
    });
  },

  async consume(token: string): Promise<string | null> {
    await ensureSeeded();
    const entry = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!entry) return null;
    await prisma.passwordResetToken.delete({ where: { token } });
    if (entry.expiresAt.getTime() < Date.now()) return null;
    return entry.userId;
  },
};
