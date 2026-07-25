"use client";

import { useMounted } from "@/hooks/use-mounted";
import { formatDate, formatDateTime, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface TimeAgoProps {
  iso: string;
  className?: string;
}

/**
 * Renders an absolute date during SSR and the first paint, then upgrades to a
 * relative label after mount. This avoids hydration mismatches caused by the
 * server and client evaluating "now" at different moments.
 */
export function TimeAgo({ iso, className }: TimeAgoProps) {
  const mounted = useMounted();

  return (
    <time dateTime={iso} title={formatDateTime(iso)} className={cn("tabular", className)}>
      {mounted ? formatRelativeTime(iso) : formatDate(iso)}
    </time>
  );
}
