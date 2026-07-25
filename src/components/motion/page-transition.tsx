"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { EASE_PREMIUM } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Fades and lifts the route content on navigation. Keyed on the pathname so
 * every route change replays the entrance.
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      className={cn(className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: EASE_PREMIUM }}
    >
      {children}
    </motion.div>
  );
}
