"use client";

import { Menu, Plus } from "lucide-react";
import Link from "next/link";

import { GlobalSearch } from "@/components/dashboard/global-search";
import { NotificationsMenu } from "@/components/dashboard/notifications-menu";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import type { AppNotification } from "@/types";
import type { User } from "@/types/auth";

export interface DashboardTopbarProps {
  user: User;
  notifications: AppNotification[];
  unreadCount: number;
  onOpenMobileNav: () => void;
}

/** Sticky dashboard header: search, quick action, notifications, profile. */
export function DashboardTopbar({
  user,
  notifications,
  unreadCount,
  onOpenMobileNav,
}: DashboardTopbarProps) {
  return (
    <header className="glass-strong edge-light sticky top-0 z-40 flex h-[var(--header-height)] items-center gap-3 border-b border-white/[0.06] px-4 sm:gap-4 sm:px-6">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="lg:hidden"
      >
        <Menu />
      </Button>

      <GlobalSearch className="max-w-md flex-1" />

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
        <Button asChild variant="gradient" size="sm" className="hidden sm:inline-flex">
          <Link href={routes.uploads}>
            <Plus className="size-3.5" />
            New upload
          </Link>
        </Button>

        <Button asChild variant="gradient" size="icon-sm" className="sm:hidden" aria-label="New upload">
          <Link href={routes.uploads}>
            <Plus />
          </Link>
        </Button>

        <NotificationsMenu notifications={notifications} unreadCount={unreadCount} />

        <UserMenu user={user} />
      </div>
    </header>
  );
}
