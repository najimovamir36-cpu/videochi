import type { Metadata } from "next";
import { CreditCard } from "lucide-react";

import { BillingActions } from "@/components/dashboard/billing-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { UsageMeter } from "@/components/dashboard/usage-meter";
import { SettingsSection } from "@/components/settings/settings-section";
import { StatusPill } from "@/components/shared/status-pill";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { plans } from "@/data/plans";
import { formatBytes, formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";

export const metadata: Metadata = buildMetadata({
  title: "Billing",
  path: routes.billing,
  description: "Manage your ClipMind AI plan, usage and invoices.",
  noIndex: true,
});

const BRAND_LABEL: Record<string, string> = { visa: "Visa", mastercard: "Mastercard", amex: "Amex" };

export default async function BillingPage() {
  const { user } = await requireSession();
  const [usage, billing] = await Promise.all([
    workspaceService.getUsage(user.id),
    workspaceService.getBilling(),
  ]);

  const plan = plans.find((p) => p.id === user.plan) ?? plans[0]!;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Billing" description="Manage your plan, usage and invoices." />

      <div className="grid gap-5 lg:max-w-3xl">
        <SettingsSection title="Plan" description="Your current subscription and what it includes.">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-xl font-semibold tracking-tight">{plan.name}</span>
              <Badge variant="accent">{plan.credits}</Badge>
            </div>
            <p className="text-[13px] text-muted-foreground">{plan.tagline}</p>
            <BillingActions plan={user.plan} />
          </div>
        </SettingsSection>

        <SettingsSection title="Usage this cycle" description={`Resets on ${formatDate(usage.resetsAt)}.`}>
          <div className="grid gap-5 sm:grid-cols-2">
            <UsageMeter
              label="Credits"
              used={usage.creditsUsed}
              total={usage.creditsTotal}
              display={`${formatNumber(usage.creditsUsed)} / ${formatNumber(usage.creditsTotal)}`}
            />
            <UsageMeter
              label="Storage"
              used={usage.storageUsed}
              total={usage.storageTotal}
              display={`${formatBytes(usage.storageUsed)} / ${formatBytes(usage.storageTotal)}`}
              tone="accent"
            />
            <UsageMeter
              label="Minutes processed"
              used={usage.minutesProcessed}
              total={usage.minutesIncluded}
              display={`${formatNumber(usage.minutesProcessed)} / ${formatNumber(usage.minutesIncluded)}`}
            />
            <UsageMeter
              label="Render minutes"
              used={usage.renderMinutesUsed}
              total={usage.renderMinutesTotal}
              display={`${formatNumber(usage.renderMinutesUsed)} / ${formatNumber(usage.renderMinutesTotal)}`}
              tone="warning"
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Payment methods" description="Cards on file for your subscription.">
          {billing.paymentMethods.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No payment method on file.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {billing.paymentMethods.map((method) => (
                <li
                  key={method.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3"
                >
                  <CreditCard className="size-4 text-muted-foreground" />
                  <span className="text-[13px] font-medium">
                    {BRAND_LABEL[method.brand] ?? method.brand} ···· {method.last4}
                  </span>
                  <span className="text-[12px] text-muted-foreground tabular">
                    exp {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                  </span>
                  {method.isDefault ? (
                    <Badge variant="secondary" className="ml-auto">
                      Default
                    </Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </SettingsSection>

        <SettingsSection title="Invoices" description="Your billing history.">
          {billing.invoices.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No invoices yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/[0.05]">
              {billing.invoices.map((invoice) => (
                <li key={invoice.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-[13px] font-medium">{invoice.number}</span>
                    <span className="text-[12px] text-muted-foreground">{invoice.periodLabel}</span>
                  </div>
                  <span className="ml-auto text-[13px] tabular">{formatCurrency(invoice.amount)}</span>
                  <StatusPill
                    status={invoice.status === "paid" ? "completed" : "queued"}
                    className="shrink-0"
                  />
                </li>
              ))}
            </ul>
          )}
        </SettingsSection>
      </div>
    </div>
  );
}
