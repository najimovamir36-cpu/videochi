import { checkoutSchema } from "@/lib/validations/billing";
import { ok, parseJsonBody, route } from "@/server/http/responses";
import { billingService } from "@/server/services/billing-service";
import { requireSession } from "@/server/services/session-service";

/**
 * `POST /api/billing/checkout` — starts a Stripe Checkout session for a paid
 * plan and returns the hosted URL to redirect the user to.
 */
export const POST = route(async (request: Request) => {
  const { user } = await requireSession();
  const input = await parseJsonBody(request, checkoutSchema);
  return ok<{ url: string }>(await billingService.createCheckoutSession(user, input.plan));
});
