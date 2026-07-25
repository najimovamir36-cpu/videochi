"use client";

import { useEffect, useState } from "react";

/**
 * `false` during SSR and the first client render, `true` afterwards.
 * Use it to gate anything that would otherwise cause a hydration mismatch
 * (relative timestamps, portals, `window` measurements).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
