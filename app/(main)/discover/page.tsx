"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Search } from "lucide-react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { useAppStore } from "@/stores/app-store";
import { useSearch } from "@/hooks/useSearch";
import type { MediaItem } from "@/stores/app-store";

function DiscoverContent() {
  const searchParams = useSearchParams();
  const { setSelectedItem } = useAppStore();
  const queryFromUrl = searchParams.get("q") || "";
  const { query, setQuery, results, isLoading } = useSearch();

  // Sync URL query param into search hook on mount
  if (queryFromUrl && !query) {
    setQuery(queryFromUrl);
  }

  const hasQuery = query.trim().length > 0;

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

          {/* Trending carousels */}
          <MediaCarousel
            title="Recommended For You"
            items={[]}
            onItemClick={setSelectedItem}
            icon={Sparkles}
            type="anime"
          />
        </>
      )}

      {hasQuery && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Search size={14} className="text-cream/30" />
            <span className="text-[13px] text-cream/50">
              Results for &ldquo;{query}&rdquo;
            </span>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
            </div>
          ) : (
            <MediaGrid
              items={(results as MediaItem[]) || []}
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
