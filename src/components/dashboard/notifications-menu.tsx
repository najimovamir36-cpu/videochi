"use client";

import { Bell, CheckCheck, CreditCard, Film, Sparkles, Wrench } from "lucide-react";
import { useState } from "react";

import { TimeAgo } from "@/components/shared/time-ago";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/config/routes";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types";

const KIND_STYLE: Record<AppNotification["kind"], { icon: typeof Bell; className: string }> = {
  export: { icon: Film, className: "bg-primary/12 text-primary" },
  analysis: { icon: Sparkles, className: "bg-accent/12 text-accent" },
  billing: { icon: CreditCard, className: "bg-success/12 text-success" },
  system: { icon: Wrench, className: "bg-white/[0.06] text-muted-foreground" },
};

export interface NotificationsMenuProps {
  notifications: AppNotification[];
  unreadCount: number;
}

/** Top-bar notification popover with optimistic "mark all read". */
export function NotificationsMenu({ notifications, unreadCount }: NotificationsMenuProps) {
  const [items, setItems] = useState(notifications);
  const [unread, setUnread] = useState(unreadCount);

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnread(0);
    try {
      await api.post(routes.api.notifications);
    } catch {
      // Non-critical: the badge re-syncs on the next full page load.
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell />
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-[9.5px] font-bold text-primary-foreground ring-2 ring-background">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[21rem] p-0">
        <div className="flex items-center justify-between px-3.5 py-3">
          <div>
            <p className="text-[13px] font-semibold">Notifications</p>
            <p className="text-[11.5px] text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "You are all caught up"}
            </p>
          </div>
          {unread > 0 ? (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-8 text-[12px]">
              <CheckCheck className="size-3.5" />
              Mark read
            </Button>
          ) : null}
        </div>

        <Separator />

        <ScrollArea className="max-h-[22rem]">
          <ul className="flex flex-col p-1.5">
            {items.map((item) => {
              const { icon: Icon, className } = KIND_STYLE[item.kind];
              return (
                <li key={item.id}>
                  <div
                    className={cn(
                      "flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.05]",
                      !item.read && "bg-white/[0.03]",
                    )}
                  >
                    <span
                      className={cn("grid size-8 shrink-0 place-items-center rounded-lg", className)}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12.5px] font-medium leading-snug">{item.title}</p>
                        {!item.read ? (
                          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                        {item.body}
                      </p>
                      <TimeAgo iso={item.createdAt} className="mt-1 block text-[11px] text-muted-foreground/80" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
