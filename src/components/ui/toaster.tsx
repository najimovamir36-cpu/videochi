"use client";

import { Toaster as SonnerToaster } from "sonner";

/** Pre-themed Sonner instance mounted once by `AppProviders`. */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      offset={20}
      gap={12}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "glass-strong !rounded-2xl !border-white/[0.09] !text-foreground !shadow-lifted !text-[13px] !gap-3",
          title: "!font-medium",
          description: "!text-muted-foreground !text-[12.5px]",
          actionButton: "!bg-primary !text-primary-foreground !rounded-lg !text-[12px]",
          cancelButton: "!bg-white/[0.06] !text-foreground !rounded-lg !text-[12px]",
          closeButton: "!bg-white/[0.08] !border-white/[0.10] !text-foreground",
          success: "!text-foreground [&_svg]:!text-success",
          error: "!text-foreground [&_svg]:!text-destructive",
          warning: "!text-foreground [&_svg]:!text-warning",
          info: "!text-foreground [&_svg]:!text-accent",
        },
      }}
    />
  );
}
