"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileVideo, FolderKanban, Loader2, Search, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types";

const KIND_ICON = {
  project: FolderKanban,
  upload: FileVideo,
  export: Sparkles,
  page: Search,
} as const;

/** Workspace search with debounced querying and ⌘K / Ctrl+K focus shortcut. */
export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 220);
  const containerRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const term = debouncedQuery.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    api
      .get<SearchResult[]>(`${routes.api.search}?q=${encodeURIComponent(term)}`, {
        signal: controller.signal,
      })
      .then((data) => setResults(data))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResults([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const onSelect = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      setQuery("");
      router.push(result.href);
    },
    [router],
  );

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        placeholder="Search projects, uploads, exports…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        startIcon={loading ? <Loader2 className="animate-spin" /> : <Search />}
        endAdornment={
          query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="mr-1.5 hidden rounded-md border border-white/[0.10] bg-white/[0.04] px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground sm:block">
              ⌘K
            </kbd>
          )
        }
        className="h-10"
      />

      <AnimatePresence>
        {showPanel ? (
          <motion.div
            id="global-search-results"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.18 }}
            className="glass-strong absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl p-1.5 shadow-lifted"
          >
            {results.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
                {loading
                  ? "Searching…"
                  : query.trim().length < 2
                    ? "Type at least two characters"
                    : `No matches for “${query.trim()}”`}
              </p>
            ) : (
              <ul className="flex flex-col">
                {results.map((result) => {
                  const Icon = KIND_ICON[result.kind];
                  return (
                    <li key={`${result.kind}-${result.id}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        onClick={() => onSelect(result)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.07] focus:bg-white/[0.07] focus:outline-none"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-muted-foreground">
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">
                            {result.title}
                          </span>
                          <span className="block truncate text-[11.5px] text-muted-foreground">
                            {result.subtitle}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {result.kind}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
