"use client";

import { useEffect } from "react";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore, type MediaItem } from "@/stores/app-store";
import { MediaCard } from "./MediaCard";
import { CatLogo } from "@/components/shared/CatLogo";

export function SearchResultsGrid() {
  const { searchQuery, setSearchQuery, setSelectedItem } = useAppStore();

  const { data: results = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["search-grid", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await fetch(
        `/api/search-all?q=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: searchQuery.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // ESC to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchQuery("");
    }
    if (searchQuery) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [searchQuery, setSearchQuery]);

  if (!searchQuery.trim()) return null;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-gold" />
          <h1 className="text-2xl font-extrabold tracking-tight text-cream">
            Search
          </h1>
          <span className="ml-1 text-[13px] text-cream/30">
            &ldquo;{searchQuery}&rdquo;
          </span>
          {!isLoading && results.length > 0 && (
            <span className="ml-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">
              {results.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setSearchQuery("")}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-cream/40 transition-colors hover:text-cream/60"
        >
          <X size={12} /> Clear
        </button>
      </div>

      {/* Skeleton grid while loading */}
      {isLoading && (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(172px, 1fr))",
          }}
        >
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl bg-white/[0.03] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Results grid — poster MediaCards */}
      {!isLoading && results.length > 0 && (
        <div
          className="grid gap-4 overflow-visible py-2"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(172px, 1fr))",
          }}
        >
          {results.map((item) => (
            <div key={item.id} style={{ overflow: "visible" }}>
              <MediaCard
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!isLoading && results.length === 0 && searchQuery.trim() && (
        <div className="py-20 text-center">
          <CatLogo size={64} className="mx-auto mb-4 opacity-20" />
          <h3 className="mb-1.5 text-[16px] font-bold text-cream/40">
            No results found
          </h3>
          <p className="mx-auto max-w-[320px] text-[12px] text-cream/25">
            No results found for &ldquo;{searchQuery}&rdquo;. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
