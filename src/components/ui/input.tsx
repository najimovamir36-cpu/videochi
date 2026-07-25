"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Icon rendered inside the field on the left. */
  startIcon?: React.ReactNode;
  /** Interactive slot on the right, e.g. a password reveal toggle. */
  endAdornment?: React.ReactNode;
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", startIcon, endAdornment, invalid, ...props }, ref) => {
    const field = (
      <input
        ref={ref}
        type={type}
        data-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm text-foreground shadow-inset outline-none transition-all duration-200 ease-premium",
          "placeholder:text-muted-foreground/70",
          "hover:border-white/[0.14] hover:bg-white/[0.045]",
          "focus:border-primary/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/12",
          "disabled:cursor-not-allowed disabled:opacity-55",
          "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "data-[invalid]:border-destructive/60 data-[invalid]:focus:ring-destructive/15",
          startIcon && "pl-10",
          endAdornment && "pr-11",
          className,
        )}
        {...props}
      />
    );

    if (!startIcon && !endAdornment) return field;

    return (
      <div className="relative w-full">
        {startIcon ? (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4"
            aria-hidden
          >
            {startIcon}
          </span>
        ) : null}
        {field}
        {endAdornment ? (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{endAdornment}</span>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
