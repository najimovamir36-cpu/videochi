import { env } from "@/server/core/env";
import { isBillingConfigured, stripe } from "@/server/billing/stripe";
import { billingService } from "@/server/services/billing-service";

/**
 * `POST /api/billing/webhook` — receives Stripe subscription lifecycle events.
 *
 * The raw request body and the `stripe-signature` header are verified against
 * `STRIPE_WEBHOOK_SECRET` before anything is trusted; a bad signature is a 400.
 * This endpoint intentionally does not use the shared `route()` wrapper — Stripe
 * expects a bare 2xx acknowledgement, not the app's JSON envelope.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isBillingConfigured() || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Billing not configured", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const payload = await request.text();

  let event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("[billing] webhook signature verification failed", error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await billingService.applyWebhookEvent(event);
  } catch (error) {
    console.error(`[billing] failed to apply webhook ${event.type}`, error);
    return new Response("Handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
