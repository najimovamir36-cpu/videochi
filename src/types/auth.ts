export type PlanId = "free" | "creator" | "studio" | "enterprise";

export type UserRole = "owner" | "editor" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  plan: PlanId;
  createdAt: string;
  emailVerified: boolean;
}

/** Persisted user shape — never leaves the server layer. */
export interface UserRecord extends User {
  passwordHash: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  /** Issued-at, seconds since epoch. */
  iat: number;
  /** Expiry, seconds since epoch. */
  exp: number;
}

export interface Session {
  user: User;
  expiresAt: string;
}

export interface AuthResponse {
  user: User;
  expiresAt: string;
}
