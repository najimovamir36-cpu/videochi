"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * `useState` mirrored into `localStorage`, SSR-safe and synchronised across
 * tabs. Reads happen after mount so the server and first client render agree.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {
      // Corrupt or blocked storage — fall back to the initial value.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or private mode — ignore, state still works in-memory.
    }
  }, [key, value, hydrated]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key || event.newValue === null) return;
      try {
        setValue(JSON.parse(event.newValue) as T);
      } catch {
        // Ignore malformed cross-tab payloads.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const reset = useCallback(() => {
    setValue(initialValue);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  }, [initialValue, key]);

  return { value, setValue, reset, hydrated } as const;
}
