import Stripe from "stripe";

import { env } from "@/server/core/env";
import type { PlanId } from "@/types/auth";

/**
 * Stripe client and plan⇄price mapping.
 *
 * Billing is optional: with no `STRIPE_SECRET_KEY` the app runs in display-only
 * mode (the seeded invoices and plans still render) and any checkout attempt
 * returns a clear "not configured" error. Set the key and the two price ids to
 * turn on real subscriptions.
 */

export function isBillingConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}

let cached: Stripe | null = null;

/** Returns the Stripe client, or throws if billing isn't configured. */
export function stripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured.");
  cached ??= new Stripe(env.STRIPE_SECRET_KEY, { typescript: true });
  return cached;
}

/** Maps a plan to its configured Stripe price id (only the paid plans have one). */
export function priceForPlan(plan: PlanId): string | null {
  switch (plan) {
    case "creator":
      return env.STRIPE_PRICE_CREATOR || null;
    case "studio":
      return env.STRIPE_PRICE_STUDIO || null;
    default:
      return null;
  }
}

/** Reverse mapping used when a webhook tells us which price the user subscribed to. */
export function planForPrice(priceId: string | null | undefined): PlanId {
  if (priceId && priceId === env.STRIPE_PRICE_CREATOR) return "creator";
  if (priceId && priceId === env.STRIPE_PRICE_STUDIO) return "studio";
  return "free";
}
