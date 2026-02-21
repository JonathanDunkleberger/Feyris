"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore, type MediaItem } from "@/stores/app-store";
import { MEDIA_TYPES } from "@/lib/constants";

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
            Search Results
          </h1>
          <span className="ml-1 text-[13px] text-cream/30">
            for &ldquo;{searchQuery}&rdquo;
          </span>
        </div>
        <button
          onClick={() => setSearchQuery("")}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-cream/40 transition-colors hover:text-cream/60"
        >
          <X size={12} /> Clear
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gold" />
          <span className="ml-2 text-[13px] text-cream/30">Searching...</span>
        </div>
      )}

      {/* Results grid — 16:9 backdrop style like XPrime */}
      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((item) => {
            const config = MEDIA_TYPES[item.media_type as keyof typeof MEDIA_TYPES];
            const bgImage = item.backdrop_image_url || item.cover_image_url;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative overflow-hidden rounded-xl border border-white/[0.04] transition-all hover:border-gold/20 hover:scale-[1.02] focus:outline-none"
                style={{ aspectRatio: "16/9" }}
              >
                {/* Backdrop image */}
                {bgImage ? (
                  <Image
                    src={bgImage}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-fey-surface to-fey-black" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="line-clamp-2 text-[13px] font-bold leading-tight text-white drop-shadow-lg">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    {config && (
                      <span
                        className="rounded-[3px] px-1 py-[1px] text-[9px] font-bold uppercase"
                        style={{
                          background: config.bg || "rgba(200,164,78,0.1)",
                          color: config.color || "#c8a44e",
                        }}
                      >
                        {config.label}
                      </span>
                    )}
                    {item.year && (
                      <span className="text-[10px] text-white/50">
                        {item.year}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No results */}
      {!isLoading && results.length === 0 && searchQuery.trim() && (
        <div className="py-20 text-center">
          <Search size={40} className="mx-auto mb-4 text-cream/10" />
          <h3 className="mb-1.5 text-[16px] font-bold text-cream/40">
            No results found
          </h3>
          <p className="mx-auto max-w-[320px] text-[12px] text-cream/25">
            Try a different search term or check the spelling.
          </p>
        </div>
      )}
    </div>
  );
}
