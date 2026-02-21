"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Search, Loader2, Tv, Gamepad2, BookOpen, Monitor, Film, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MediaGrid } from "@/components/media/MediaGrid";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { useAppStore } from "@/stores/app-store";
import type { MediaItem } from "@/stores/app-store";
import type { MediaType } from "@/lib/constants";

/* Re-use the same home-carousels endpoint for browsing */
interface CarouselData {
  key: string;
  title: string;
  type: string;
  items: MediaItem[];
}

const ICON_MAP: Record<string, typeof Tv> = {
  anime: Tv,
  game: Gamepad2,
  book: BookOpen,
  tv: Monitor,
  film: Film,
};

function DiscoverContent() {
  const searchParams = useSearchParams();
  const { setSelectedItem, searchQuery, setSearchQuery } = useAppStore();
  const queryFromUrl = searchParams.get("q") || "";
  const activeQuery = queryFromUrl || searchQuery;

  // Sync URL query to store on mount
  useEffect(() => {
    if (queryFromUrl) setSearchQuery(queryFromUrl);
  }, [queryFromUrl, setSearchQuery]);

  // Search results from the real API
  const { data: searchResults = [], isLoading: isSearching } = useQuery<MediaItem[]>({
    queryKey: ["discover-search", activeQuery],
    queryFn: async () => {
      if (!activeQuery.trim()) return [];
      const res = await fetch(`/api/search-all?q=${encodeURIComponent(activeQuery)}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: activeQuery.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Browse carousels when not searching
  const { data: carousels = [], isLoading: isLoadingCarousels } = useQuery<CarouselData[]>({
    queryKey: ["home-carousels"],
    queryFn: async () => {
      const res = await fetch("/api/home-carousels");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
    enabled: !activeQuery.trim(),
  });

  const hasQuery = activeQuery.trim().length > 0;

  return (
    <div className="animate-fadeIn">
      <h1 className="mb-[3px] text-2xl font-extrabold tracking-tight text-cream">
        Discover
      </h1>
      <p className="mb-[18px] text-[12.5px] text-cream/30">
        Cross-medium recommendations powered by your taste.
      </p>

      {!hasQuery && (
        <>
          {/* Recommendation hero */}
          <div className="mb-6 rounded-[14px] border border-gold/[0.05] p-[26px] text-center"
            style={{
              background: "linear-gradient(135deg, rgba(20,18,28,0.85), rgba(14,14,20,0.9))",
            }}
          >
            <Sparkles size={28} className="mx-auto mb-2 text-gold" />
            <h3 className="mb-[5px] text-base font-bold text-cream">
              Personalized Recommendations
            </h3>
            <p className="mx-auto max-w-[380px] text-[11.5px] text-cream/35">
              Add items to your library and rate them to unlock cross-medium
              recommendations. We&apos;ll find books, games, and shows that
              match your unique taste.
            </p>
          </div>

          {/* Browseable carousels from real APIs */}
          {isLoadingCarousels ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mb-6">
                <div className="mb-3 h-5 w-48 animate-pulse rounded bg-white/[0.04]" />
                <div className="flex gap-3 overflow-hidden">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-[248px] w-[172px] shrink-0 animate-pulse rounded-xl bg-white/[0.03]"
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            carousels.map((c) => (
              <MediaCarousel
                key={c.key}
                title={c.title}
                items={c.items}
                onItemClick={setSelectedItem}
                icon={ICON_MAP[c.type] || Flame}
                type={c.type as MediaType}
              />
            ))
          )}
        </>
      )}

      {hasQuery && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            {isSearching ? (
              <Loader2 size={14} className="animate-spin text-gold" />
            ) : (
              <Search size={14} className="text-cream/30" />
            )}
            <span className="text-[13px] text-cream/50">
              {isSearching
                ? `Searching for "${activeQuery}"...`
                : `${searchResults.length} results for "${activeQuery}"`}
            </span>
          </div>
          {!isSearching && searchResults.length === 0 ? (
            <div className="py-20 text-center">
              <Search size={32} className="mx-auto mb-3 text-cream/10" />
              <p className="text-[13px] font-semibold text-cream/30">
                No results found for &ldquo;{activeQuery}&rdquo;
              </p>
              <p className="mt-1 text-[11px] text-cream/20">
                Try searching for anime, games, books, TV shows, or films.
              </p>
            </div>
          ) : (
            <MediaGrid
              items={searchResults}
              onItemClick={setSelectedItem}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
