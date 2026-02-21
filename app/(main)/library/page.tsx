"use client";

import { useState } from "react";
import { SlidersHorizontal, Tv, Gamepad2, BookOpen, Monitor, Film } from "lucide-react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useAppStore } from "@/stores/app-store";
import { useLibrary } from "@/hooks/useLibrary";
import type { MediaItem, LibraryEntry } from "@/stores/app-store";

const FILTER_TYPES = [
  { label: "All", icon: null },
  { label: "Anime", icon: Tv },
  { label: "Game", icon: Gamepad2 },
  { label: "Book", icon: BookOpen },
  { label: "TV", icon: Monitor },
  { label: "Film", icon: Film },
] as const;

export default function LibraryPage() {
  const { setSelectedItem } = useAppStore();
  const { data: library, isLoading } = useLibrary();
  const [activeFilter, setActiveFilter] = useState("All");

  // Extract media items from library entries
  const mediaItems: MediaItem[] = ((library as LibraryEntry[] | undefined) || [])
    .filter((entry: LibraryEntry) => entry.media)
    .filter((entry: LibraryEntry) =>
      activeFilter === "All"
        ? true
        : entry.media!.media_type.toLowerCase() === activeFilter.toLowerCase()
    )
    .map((entry: LibraryEntry) => entry.media!);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-[18px] flex items-center justify-between">
        <div>
          <h1 className="mb-[3px] text-2xl font-extrabold tracking-tight text-cream">
            Your Library
          </h1>
          <p className="text-[12.5px] text-cream/30">
            Everything you&apos;ve tracked, rated, and loved.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter chips */}
          <div className="hidden items-center gap-[3px] md:flex">
            {FILTER_TYPES.map((f) => {
              const isActive = activeFilter === f.label;
              const Icon = f.icon;
              return (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.label)}
                  className="flex items-center gap-1 rounded-[7px] border px-2.5 py-[5px] text-[10.5px] font-semibold transition-all"
                  style={{
                    background: isActive
                      ? "rgba(200,164,78,0.08)"
                      : "transparent",
                    borderColor: isActive
                      ? "rgba(200,164,78,0.15)"
                      : "transparent",
                    color: isActive
                      ? "#c8a44e"
                      : "rgba(224,218,206,0.3)",
                  }}
                >
                  {Icon && <Icon size={11} />} {f.label}
                </button>
              );
            })}
          </div>
          <button className="flex items-center gap-1 rounded-[7px] border border-gold/10 bg-gold/[0.06] px-3.5 py-[7px] text-[11.5px] font-semibold text-gold md:hidden">
            <SlidersHorizontal size={12} /> Filter
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
        </div>
      ) : (
        <MediaGrid
          items={mediaItems}
          onItemClick={setSelectedItem}
        />
      )}
    </div>
  );
}
