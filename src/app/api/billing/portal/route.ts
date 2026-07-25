import { ok, route } from "@/server/http/responses";
import { billingService } from "@/server/services/billing-service";
import { requireSession } from "@/server/services/session-service";

/**
 * `POST /api/billing/portal` — returns a Stripe billing-portal URL so the user
 * can update their card, switch plans, or cancel.
 */
export const POST = route(async () => {
  const { user } = await requireSession();
  return ok<{ url: string }>(await billingService.createPortalSession(user));
});
