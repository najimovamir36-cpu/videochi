import type Stripe from "stripe";

import { BadRequestError, ServiceUnavailableError } from "@/server/core/errors";
import { env } from "@/server/core/env";
import { isBillingConfigured, planForPrice, priceForPlan, stripe } from "@/server/billing/stripe";
import { prisma } from "@/server/db/client";
import type { PlanId, User } from "@/types/auth";

/**
 * Subscription billing use-cases.
 *
 * Uses Stripe Checkout (hosted) so no card data ever touches this server. The
 * webhook is the source of truth for a user's plan: checkout only starts the
 * flow, and `customer.subscription.*` events promote or downgrade the account.
 */
export const billingService = {
  isConfigured: isBillingConfigured,

  /** Creates (or reuses) the user's Stripe customer and returns a checkout URL. */
  async createCheckoutSession(user: User, plan: PlanId): Promise<{ url: string }> {
    if (!isBillingConfigured()) {
      throw new ServiceUnavailableError("Billing is not configured on this server.");
    }

    const price = priceForPlan(plan);
    if (!price) throw new BadRequestError(`No Stripe price is configured for the ${plan} plan.`);

    const customerId = await this.ensureCustomer(user);

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price, quantity: 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/billing?status=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?status=cancelled`,
      allow_promotion_codes: true,
    });

    if (!session.url) throw new ServiceUnavailableError("Stripe did not return a checkout URL.");
    return { url: session.url };
  },

  /** Returns a Stripe billing-portal URL so the user can manage their subscription. */
  async createPortalSession(user: User): Promise<{ url: string }> {
    if (!isBillingConfigured()) {
      throw new ServiceUnavailableError("Billing is not configured on this server.");
    }
    const customerId = await this.ensureCustomer(user);
    const session = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
    });
    return { url: session.url };
  },

  /** Finds or creates the Stripe customer for a user and persists the id. */
  async ensureCustomer(user: User): Promise<string> {
    const record = await prisma.user.findUnique({ where: { id: user.id } });
    if (record?.stripeCustomerId) return record.stripeCustomerId;

    const customer = await stripe().customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });

    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
    return customer.id;
  },

  /**
   * Applies a verified Stripe webhook event. Only subscription lifecycle events
   * change anything; everything else is acknowledged and ignored.
   */
  async applyWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await this.syncSubscription(event.data.object);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.subscription && typeof session.subscription === "string") {
          const subscription = await stripe().subscriptions.retrieve(session.subscription);
          await this.syncSubscription(subscription);
        }
        break;
      }
      default:
        break;
    }
  },

  /** Reconciles a Stripe subscription onto the matching user row. */
  async syncSubscription(subscription: Stripe.Subscription): Promise<void> {
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

    const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
    if (!user) return;

    const active = subscription.status === "active" || subscription.status === "trialing";
    const priceId = subscription.items.data[0]?.price.id ?? null;
    const plan: PlanId = active ? planForPrice(priceId) : "free";
    // `current_period_end` sits on the subscription in older API versions and on
    // the subscription item in newer ones — read whichever is present.
    const periodEnd =
      (subscription as unknown as { current_period_end?: number }).current_period_end ??
      (subscription.items.data[0] as unknown as { current_period_end?: number } | undefined)
        ?.current_period_end ??
      null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan,
        stripeSubscriptionId: subscription.status === "canceled" ? null : subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });
  },
};
