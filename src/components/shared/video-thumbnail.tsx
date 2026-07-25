import { Play } from "lucide-react";

import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface VideoThumbnailProps {
  /** Hex colour used to generate the gradient. */
  color: string;
  /** Duration in seconds; hidden when 0. */
  duration?: number;
  label?: string;
  aspect?: "video" | "vertical" | "square";
  className?: string;
}

const ASPECT: Record<NonNullable<VideoThumbnailProps["aspect"]>, string> = {
  video: "aspect-video",
  vertical: "aspect-[9/16]",
  square: "aspect-square",
};

/**
 * Deterministic gradient poster frame. Real thumbnails replace this once the
 * media pipeline can extract frames — the component API stays the same.
 */
export function VideoThumbnail({
  color,
  duration = 0,
  label,
  aspect = "video",
  className,
}: VideoThumbnailProps) {
  return (
    <div
      className={cn(
        "group/thumb relative w-full shrink-0 overflow-hidden rounded-xl border border-white/[0.07]",
        ASPECT[aspect],
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${color}f2 0%, ${color}59 46%, rgba(9,9,14,0.94) 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_0%,rgba(255,255,255,0.28),transparent_58%)]" />
      <div className="noise absolute inset-0" />

      <div className="absolute inset-0 grid place-items-center">
        {/* No backdrop-filter here: these thumbnails render inside glass
            panels, and nested backdrop-filters composite unreliably. */}
        <span className="grid size-9 place-items-center rounded-full bg-black/45 text-white/95 ring-1 ring-white/25 transition-transform duration-300 ease-premium group-hover/thumb:scale-110">
          <Play className="size-3.5 translate-x-[1px]" fill="currentColor" />
        </span>
      </div>

      {duration > 0 ? (
        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium tabular text-white/90">
          {formatDuration(duration)}
        </span>
      ) : null}

      {label ? (
        <span className="absolute bottom-1.5 left-1.5 max-w-[70%] truncate rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white/85">
          {label}
        </span>
      ) : null}
    </div>
  );
}
