"use client";

import { useState, type ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { PageTransition } from "@/components/motion/page-transition";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types";
import type { User } from "@/types/auth";
import type { UsageSummary } from "@/types/media";

export interface DashboardShellProps {
  user: User;
  usage: UsageSummary;
  notifications: AppNotification[];
  unreadCount: number;
  children: ReactNode;
}

/**
 * Application chrome: fixed sidebar on desktop, drawer on mobile, sticky top
 * bar and animated content region. Collapse state persists per browser.
 */
export function DashboardShell({
  user,
  usage,
  notifications,
  unreadCount,
  children,
}: DashboardShellProps) {
  const { value: collapsed, setValue: setCollapsed } = useLocalStorage(
    "clipmind:sidebar-collapsed",
    false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-white/[0.06] bg-black/25 backdrop-blur-xl transition-[width] duration-300 ease-premium lg:block",
          collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]",
        )}
      >
        <DashboardSidebar
          usage={usage}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(!collapsed)}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[var(--sidebar-width)] p-0" hideClose>
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <DashboardSidebar
            usage={usage}
            collapsed={false}
            onToggleCollapsed={() => setCollapsed(!collapsed)}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-300 ease-premium",
          collapsed ? "lg:pl-[var(--sidebar-width-collapsed)]" : "lg:pl-[var(--sidebar-width)]",
        )}
      >
        <DashboardTopbar
          user={user}
          notifications={notifications}
          unreadCount={unreadCount}
          onOpenMobileNav={() => setMobileOpen(true)}
        />

        <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <PageTransition className="mx-auto w-full max-w-[85rem]">{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
