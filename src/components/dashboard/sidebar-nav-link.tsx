"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DashboardNavItem } from "@/config/navigation";

export interface SidebarNavLinkProps {
  item: DashboardNavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}

/** Sidebar row with an animated active indicator and collapsed tooltip. */
export function SidebarNavLink({ item, collapsed = false, onNavigate }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium outline-none transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {isActive ? (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl border border-white/[0.09] bg-white/[0.06] shadow-inset"
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
        />
      ) : (
        <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:bg-white/[0.035] group-hover:opacity-100" />
      )}

      <Icon
        className={cn(
          "relative size-[18px] shrink-0 transition-colors duration-200",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
      />

      {collapsed ? null : (
        <>
          <span className="relative flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <span className="relative rounded-full bg-primary/15 px-1.5 py-0.5 text-[10.5px] font-semibold text-primary">
              {item.badge}
            </span>
          ) : null}
        </>
      )}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">
        <p className="font-medium">{item.label}</p>
        <p className="text-muted-foreground">{item.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
