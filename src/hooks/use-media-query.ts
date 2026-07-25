"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query.
 * Returns `false` on the server so the first paint matches the SSR output.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export const BREAKPOINTS = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
} as const;

export function useIsDesktop(): boolean {
  return useMediaQuery(BREAKPOINTS.lg);
}

export function useIsTablet(): boolean {
  return useMediaQuery(BREAKPOINTS.md);
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
