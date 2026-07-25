import { cn } from "@/lib/utils";

/** Loading placeholder with a moving sheen rather than a flat pulse. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer-line rounded-lg bg-white/[0.055]", className)}
      aria-hidden
      {...props}
    />
  );
}

/** Multi-line text skeleton. */
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-3.5", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText };
