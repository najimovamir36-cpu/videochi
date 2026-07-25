import { ok, route } from "@/server/http/responses";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";
import type { AppNotification } from "@/types";

/** `GET /api/notifications` — the top-bar notification feed. */
export const GET = route(async () => {
  const { user } = await requireSession();
  return ok<AppNotification[]>(await workspaceService.listNotifications(user.id));
});

/** `POST /api/notifications` — marks every notification read. */
export const POST = route(async () => {
  const { user } = await requireSession();
  await workspaceService.markNotificationsRead(user.id);
  return ok({ unreadCount: 0 });
});
