import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface UsageMeterProps {
  label: string;
  used: number;
  total: number;
  /** Pre-formatted display value, e.g. "742 / 1,200 credits". */
  display: string;
  className?: string;
  tone?: "brand" | "accent" | "warning";
}

const TONE_CLASS: Record<NonNullable<UsageMeterProps["tone"]>, string> = {
  brand: "bg-brand-gradient",
  accent: "bg-gradient-to-r from-cyan-500 to-sky-400",
  warning: "bg-gradient-to-r from-amber-500 to-orange-400",
};

/** Labelled progress row used across the usage panel and billing page. */
export function UsageMeter({
  label,
  used,
  total,
  display,
  className,
  tone = "brand",
}: UsageMeterProps) {
  const percent = total <= 0 ? 0 : Math.min(100, (used / total) * 100);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-foreground/85">{label}</span>
        <span className="text-[12px] tabular text-muted-foreground">{display}</span>
      </div>

      <Progress
        value={percent}
        indicatorClassName={TONE_CLASS[tone]}
        aria-label={`${label}: ${Math.round(percent)}% used`}
      />

      <p className="text-[11.5px] tabular text-muted-foreground">
        {Math.round(percent)}% used
      </p>
    </div>
  );
}
