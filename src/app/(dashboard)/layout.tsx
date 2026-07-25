import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { routes } from "@/config/routes";
import { getSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";

/**
 * Authenticated application shell.
 *
 * `middleware.ts` already turns guests away, but it only checks the cookie
 * signature. This is where the session is resolved against the data layer, so a
 * token signed for a deleted account stops here.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect(routes.login);

  const { usage, notifications, unreadNotifications } = await workspaceService.getOverview(
    session.user.id,
  );

  return (
    <DashboardShell
      user={session.user}
      usage={usage}
      notifications={notifications}
      unreadCount={unreadNotifications}
    >
      {children}
    </DashboardShell>
  );
}
