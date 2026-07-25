"use client";

import { motion } from "framer-motion";
import { ArrowRight, Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { marketingNav } from "@/config/navigation";
import { routes } from "@/config/routes";
import { useScrollState } from "@/hooks/use-scroll-state";
import { EASE_PREMIUM } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Sticky, frosted marketing header that condenses on scroll. */
export function MarketingNavbar() {
  const { scrolled } = useScrollState(12);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE_PREMIUM }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4"
    >
      <div
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-2xl px-3 transition-all duration-500 ease-premium sm:px-4",
          scrolled
            ? "glass-strong edge-light shadow-lifted"
            : "border border-transparent bg-transparent",
        )}
      >
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.login}>Sign in</Link>
          </Button>
          <Button asChild variant="gradient" size="sm" className="pr-3.5">
            <Link href={routes.register}>
              Start free
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon-sm" className="lg:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[19rem]">
            <SheetHeader>
              <SheetTitle asChild>
                <Logo />
              </SheetTitle>
            </SheetHeader>

            <Separator className="my-2" />

            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {marketingNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="group flex flex-col gap-0.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.06]"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.description ? (
                    <span className="text-[12px] text-muted-foreground">{item.description}</span>
                  ) : null}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-2.5">
              <Button asChild variant="outline" fullWidth>
                <Link href={routes.login} onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild variant="gradient" fullWidth>
                <Link href={routes.register} onClick={() => setMobileOpen(false)}>
                  <Sparkles className="size-4" />
                  Start free
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
