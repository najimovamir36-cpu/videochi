/**
 * Centralised route map. Never hard-code a path in a component — import it
 * from here so renames stay a one-line change.
 */

export const routes = {
  home: "/",
  pricing: "/pricing",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",

  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  dashboard: "/dashboard",
  projects: "/projects",
  uploads: "/uploads",
  exports: "/exports",
  settings: "/settings",
  billing: "/billing",

  api: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    session: "/api/auth/session",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
    profile: "/api/settings/profile",
    password: "/api/settings/password",
    contact: "/api/contact",
    projects: "/api/projects",
    uploads: "/api/uploads",
    exports: "/api/exports",
    stats: "/api/stats",
    notifications: "/api/notifications",
    search: "/api/search",
    checkout: "/api/billing/checkout",
    billingPortal: "/api/billing/portal",
  },
} as const;

/** Routes that require an authenticated session. */
export const protectedRoutes = [
  routes.dashboard,
  routes.projects,
  routes.uploads,
  routes.exports,
  routes.settings,
  routes.billing,
] as const;

/** Routes an authenticated user should be redirected away from. */
export const guestOnlyRoutes = [routes.login, routes.register, routes.forgotPassword] as const;

export function isProtectedPath(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isGuestOnlyPath(pathname: string): boolean {
  return guestOnlyRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
