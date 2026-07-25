"use client";

import { useEffect, useState } from "react";

export interface ScrollState {
  /** Page has scrolled past `threshold`. */
  scrolled: boolean;
  /** Vertical offset in pixels. */
  y: number;
  direction: "up" | "down";
}

/**
 * Throttled (rAF) scroll observer used by the sticky marketing header.
 */
export function useScrollState(threshold = 16): ScrollState {
  const [state, setState] = useState<ScrollState>({ scrolled: false, y: 0, direction: "up" });

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setState((previous) => {
        const direction = y > lastY + 2 ? "down" : y < lastY - 2 ? "up" : previous.direction;
        lastY = y;
        const scrolled = y > threshold;
        if (previous.y === y && previous.scrolled === scrolled && previous.direction === direction) {
          return previous;
        }
        return { scrolled, y, direction };
      });
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return state;
}
