"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      data-invalid={invalid || undefined}
      className={cn(
        "min-h-[128px] w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-sm text-foreground shadow-inset outline-none transition-all duration-200 ease-premium",
        "placeholder:text-muted-foreground/70",
        "hover:border-white/[0.14] hover:bg-white/[0.045]",
        "focus:border-primary/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/12",
        "disabled:cursor-not-allowed disabled:opacity-55",
        "data-[invalid]:border-destructive/60 data-[invalid]:focus:ring-destructive/15",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
