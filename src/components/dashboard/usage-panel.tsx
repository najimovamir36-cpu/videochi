import { ArrowUpRight, Coins, HardDrive, Timer } from "lucide-react";
import Link from "next/link";

import { UsageMeter } from "@/components/dashboard/usage-meter";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/config/routes";
import { formatBytes, formatDate, formatNumber } from "@/lib/format";
import type { UsageSummary } from "@/types/media";

/** Credits, storage and render-minute meters for the current billing cycle. */
export function UsagePanel({ usage }: { usage: UsageSummary }) {
  return (
    <Reveal preset="up">
      <Card className="h-full">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Usage this cycle</CardTitle>
            <p className="text-[12px] text-muted-foreground">
              Resets {formatDate(usage.resetsAt)}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.billing}>
              Manage
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="space-y-5">
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
            display={`${formatBytes(usage.storageUsed, 0)} / ${formatBytes(usage.storageTotal, 0)}`}
            tone="accent"
          />

          <UsageMeter
            label="Render minutes"
            used={usage.renderMinutesUsed}
            total={usage.renderMinutesTotal}
            display={`${formatNumber(usage.renderMinutesUsed)} / ${formatNumber(usage.renderMinutesTotal)}`}
            tone="warning"
          />

          <Separator />

          <dl className="grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="mx-auto grid size-8 place-items-center rounded-lg bg-white/[0.05] text-primary">
                <Coins className="size-3.5" />
              </dt>
              <dd className="mt-2 text-[13px] font-semibold tabular">
                {formatNumber(usage.creditsTotal - usage.creditsUsed)}
              </dd>
              <dd className="text-[11px] text-muted-foreground">credits left</dd>
            </div>
            <div>
              <dt className="mx-auto grid size-8 place-items-center rounded-lg bg-white/[0.05] text-accent">
                <HardDrive className="size-3.5" />
              </dt>
              <dd className="mt-2 text-[13px] font-semibold tabular">
                {formatBytes(usage.storageTotal - usage.storageUsed, 0)}
              </dd>
              <dd className="text-[11px] text-muted-foreground">storage free</dd>
            </div>
            <div>
              <dt className="mx-auto grid size-8 place-items-center rounded-lg bg-white/[0.05] text-warning">
                <Timer className="size-3.5" />
              </dt>
              <dd className="mt-2 text-[13px] font-semibold tabular">
                {formatNumber(usage.minutesIncluded - usage.minutesProcessed)}
              </dd>
              <dd className="text-[11px] text-muted-foreground">minutes left</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </Reveal>
  );
}
