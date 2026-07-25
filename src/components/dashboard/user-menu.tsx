"use client";

import { CreditCard, LifeBuoy, LogOut, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/utils";
import type { User } from "@/types/auth";

const PLAN_LABEL: Record<User["plan"], string> = {
  free: "Free",
  creator: "Creator",
  studio: "Studio",
  enterprise: "Enterprise",
};

/** Avatar dropdown with account links and sign out. */
export function UserMenu({ user }: { user: User }) {
  const { logout, isPending } = useAuth();

  const onSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out");
    } catch {
      toast.error("Could not sign out. Try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl p-1 pr-2 outline-none transition-colors hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label="Account menu"
        >
          <Avatar>
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 flex-col items-start sm:flex">
            <span className="max-w-[9rem] truncate text-[12.5px] font-medium leading-tight">
              {user.name}
            </span>
            <span className="text-[11px] leading-tight text-muted-foreground">
              {PLAN_LABEL[user.plan]} plan
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[15.5rem]">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Avatar className="size-10">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{user.name}</p>
            <p className="truncate text-[11.5px] text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="px-3 pb-2">
          <Badge variant={user.plan === "free" ? "secondary" : "default"}>
            {PLAN_LABEL[user.plan]} plan
          </Badge>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={routes.settings}>
            <UserCircle />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routes.settings}>
            <Settings />
            Workspace settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routes.billing}>
            <CreditCard />
            Billing and credits
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routes.contact}>
            <LifeBuoy />
            Contact support
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void onSignOut();
          }}
          disabled={isPending}
          className="text-destructive focus:text-destructive [&_svg]:text-destructive"
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
