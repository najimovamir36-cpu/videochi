"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium outline-none transition-all duration-200 ease-premium disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-glow-sm hover:bg-primary/92 hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.65)] active:scale-[0.985]",
        gradient:
          "bg-brand-gradient bg-[length:200%_200%] text-white shadow-[0_10px_36px_-12px_rgba(124,92,255,0.85)] hover:bg-[position:100%_50%] active:scale-[0.985]",
        secondary:
          "bg-secondary text-secondary-foreground border border-white/[0.06] hover:bg-secondary/80 active:scale-[0.985]",
        outline:
          "border border-white/[0.10] bg-white/[0.02] text-foreground backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.985]",
        ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.985]",
        success: "bg-success text-success-foreground hover:bg-success/90 active:scale-[0.985]",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px]",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-[15px]",
        xl: "h-14 px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-9",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  /** Rendered before the label; hidden while `loading`. */
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      icon,
      iconRight,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
        {children}
        {loading ? null : iconRight}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
