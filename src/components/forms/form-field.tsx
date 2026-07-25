import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  /** Secondary text on the right of the label, e.g. a counter or "Optional". */
  hint?: ReactNode;
  className?: string;
}

/** Label + control + inline error, with the accessibility wiring done once. */
export function FormField({ id, label, children, error, hint, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {hint ? <span className="text-[11.5px] text-muted-foreground">{hint}</span> : null}
      </div>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[12px] font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
