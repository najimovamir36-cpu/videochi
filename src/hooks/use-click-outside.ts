"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Calls `handler` when a pointer event lands outside the returned ref, or when
 * Escape is pressed. Used by the search panel and notification popover.
 */
export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  enabled = true,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event: PointerEvent) => {
      const node = ref.current;
      if (!node || node.contains(event.target as Node)) return;
      handlerRef.current();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handlerRef.current();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled]);

  return ref;
}
