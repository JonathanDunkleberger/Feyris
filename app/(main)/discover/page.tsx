"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Search, Tv, Gamepad2, BookOpen, Monitor, Film } from "lucide-react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { useAppStore } from "@/stores/app-store";
import type { MediaItem } from "@/stores/app-store";
import {
  ALL_MOCK_MEDIA,
  TRENDING_ANIME,
  POPULAR_GAMES,
  RECOMMENDED_BOOKS,
  BINGEWORTHY_TV,
  CLASSIC_FILMS,
} from "@/lib/mock-data";

function DiscoverContent() {
  const searchParams = useSearchParams();
  const { setSelectedItem, searchQuery } = useAppStore();
  const queryFromUrl = searchParams.get("q") || "";
  const activeQuery = queryFromUrl || searchQuery;

  // Search mock data locally
  const results = useMemo(() => {
    if (!activeQuery.trim()) return [];
    const q = activeQuery.toLowerCase();
    return ALL_MOCK_MEDIA.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.genres.some((g) => g.toLowerCase().includes(q)) ||
        item.media_type.toLowerCase().includes(q)
    );
  }, [activeQuery]);

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

          {/* Browseable carousels */}
          <MediaCarousel
            title="Trending Anime"
            items={TRENDING_ANIME}
            onItemClick={setSelectedItem}
            icon={Tv}
            type="anime"
          />
          <MediaCarousel
            title="Popular Games"
            items={POPULAR_GAMES}
            onItemClick={setSelectedItem}
            icon={Gamepad2}
            type="game"
          />
          <MediaCarousel
            title="Recommended Books"
            items={RECOMMENDED_BOOKS}
            onItemClick={setSelectedItem}
            icon={BookOpen}
            type="book"
          />
          <MediaCarousel
            title="Binge-Worthy TV"
            items={BINGEWORTHY_TV}
            onItemClick={setSelectedItem}
            icon={Monitor}
            type="tv"
          />
          <MediaCarousel
            title="Classic Films"
            items={CLASSIC_FILMS}
            onItemClick={setSelectedItem}
            icon={Film}
            type="film"
          />
        </>
      )}

      {hasQuery && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Search size={14} className="text-cream/30" />
            <span className="text-[13px] text-cream/50">
              Results for &ldquo;{activeQuery}&rdquo;
            </span>
          </div>
          {results.length === 0 ? (
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
              items={results as MediaItem[]}
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
