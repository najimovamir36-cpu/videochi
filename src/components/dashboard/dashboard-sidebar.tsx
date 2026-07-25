"use client";

import { PanelLeftClose, PanelLeftOpen, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

import { SidebarNavLink } from "@/components/dashboard/sidebar-nav-link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { dashboardNav, dashboardSecondaryNav } from "@/config/navigation";
import { routes } from "@/config/routes";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { UsageSummary } from "@/types/media";

export interface DashboardSidebarProps {
  usage: UsageSummary;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Called after navigation in the mobile drawer so it can close itself. */
  onNavigate?: () => void;
  className?: string;
}

/** Persistent left navigation with a credits panel and collapse control. */
export function DashboardSidebar({
  usage,
  collapsed,
  onToggleCollapsed,
  onNavigate,
  className,
}: DashboardSidebarProps) {
  const creditsPercent = Math.min(100, (usage.creditsUsed / usage.creditsTotal) * 100);

  return (
    <div className={cn("flex h-full flex-col gap-5 p-3.5", className)}>
      <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "justify-between px-1")}>
        <Logo markOnly={collapsed} href={routes.dashboard} />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:inline-flex"
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Workspace">
        {dashboardNav.map((item) => (
          <SidebarNavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <Separator />

      <nav className="flex flex-col gap-1" aria-label="Account">
        {dashboardSecondaryNav.map((item) => (
          <SidebarNavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        {collapsed ? (
          <Button asChild variant="gradient" size="icon" className="mx-auto" aria-label="Upgrade plan">
            <Link href={routes.billing}>
              <Zap className="size-4" />
            </Link>
          </Button>
        ) : (
          <div className="glass rounded-2xl p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                Credits
              </span>
              <span className="text-[11.5px] tabular text-muted-foreground">
                {formatNumber(usage.creditsTotal - usage.creditsUsed)} left
              </span>
            </div>

            <Progress value={creditsPercent} className="mt-2.5 h-1.5" />

            <p className="mt-2 text-[11.5px] tabular text-muted-foreground">
              {formatNumber(usage.creditsUsed)} of {formatNumber(usage.creditsTotal)} used
            </p>

            <Button asChild variant="gradient" size="sm" fullWidth className="mt-3">
              <Link href={routes.billing}>
                <Zap className="size-3.5" />
                Upgrade plan
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
