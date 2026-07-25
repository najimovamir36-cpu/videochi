import { ArrowRight, Clock, Sparkles, UploadCloud } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import type { User } from "@/types/auth";
import type { UsageSummary } from "@/types/media";

export interface WelcomeCardProps {
  user: User;
  usage: UsageSummary;
  /** Clips generated in the current cycle. */
  clipsThisCycle: number;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Hero card at the top of the dashboard home. */
export function WelcomeCard({ user, usage, clipsThisCycle }: WelcomeCardProps) {
  const firstName = user.name.split(" ")[0] ?? user.name;
  const creditsLeft = Math.max(0, usage.creditsTotal - usage.creditsUsed);

  return (
    <Reveal preset="up">
      <section className="glass-strong edge-light noise relative overflow-hidden rounded-3xl p-6 shadow-lifted sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_90%_at_10%_0%,rgba(124,92,255,0.24),transparent_62%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-20 -z-10 size-72 rounded-full bg-accent/12 blur-[100px]"
          aria-hidden
        />

        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <Sparkles className="size-3 text-primary" />
              {formatNumber(clipsThisCycle)} clips this cycle
            </span>

            <h2 className="mt-4 text-balance font-display text-[1.7rem] font-semibold leading-[1.15] tracking-tight sm:text-[2rem]">
              {greeting()}, {firstName}.
            </h2>

            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              You have{" "}
              <span className="font-medium text-foreground">
                {formatNumber(creditsLeft)} credits
              </span>{" "}
              left, and your cycle resets {formatRelativeTime(usage.resetsAt)}. Drop in a recording
              and the studio will do the rest.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button asChild variant="gradient" size="lg">
                <Link href={routes.uploads}>
                  <UploadCloud className="size-4" />
                  Upload a video
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={routes.projects}>
                  Review projects
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <dl className="grid shrink-0 grid-cols-2 gap-3 sm:gap-4 lg:w-[19rem]">
            <div className="glass rounded-2xl p-4">
              <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                Minutes left
              </dt>
              <dd className="mt-1.5 font-display text-xl font-semibold tabular">
                {formatNumber(Math.max(0, usage.minutesIncluded - usage.minutesProcessed))}
              </dd>
            </div>
            <div className="glass rounded-2xl p-4">
              <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                Render min.
              </dt>
              <dd className="mt-1.5 font-display text-xl font-semibold tabular">
                {formatNumber(Math.max(0, usage.renderMinutesTotal - usage.renderMinutesUsed))}
              </dd>
            </div>
            <div className="glass col-span-2 rounded-2xl p-4">
              <dt className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <Clock className="size-3" />
                Avg. turnaround
              </dt>
              <dd className="mt-1.5 font-display text-xl font-semibold tabular">
                4 min 12 s
                <span className="ml-2 text-[11.5px] font-normal text-success">−18% vs last week</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </Reveal>
  );
}
