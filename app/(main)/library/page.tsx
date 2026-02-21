"use client";

import { useState } from "react";
import { SlidersHorizontal, Tv, Gamepad2, BookOpen, Monitor, Film, Lock, Compass } from "lucide-react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useAppStore } from "@/stores/app-store";
import { useUser, SignInButton } from "@clerk/nextjs";
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
  const { user } = useUser();
  const { data: library, isLoading } = useLibrary();
  const [activeFilter, setActiveFilter] = useState("All");

  // Extract media items from library entries (only when signed in)
  const libraryItems: MediaItem[] = user
    ? ((library as LibraryEntry[] | undefined) || [])
        .filter((entry: LibraryEntry) => entry.media)
        .filter((entry: LibraryEntry) =>
          activeFilter === "All"
            ? true
            : entry.media!.media_type.toLowerCase() === activeFilter.toLowerCase()
        )
        .map((entry: LibraryEntry) => entry.media!)
    : [];

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

      {/* Sign-in prompt for guests */}
      {!user && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="mb-6 rounded-2xl border border-gold/[0.08] p-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,18,28,0.9), rgba(14,14,20,0.95))",
            }}
          >
            <Lock size={36} className="mx-auto mb-4 text-cream/15" />
            <h3 className="mb-2 text-lg font-bold text-cream">
              Sign in to access your library
            </h3>
            <p className="mx-auto mb-5 max-w-sm text-[12px] text-cream/35">
              Track everything you watch, play, and read. Rate items, organize
              your collection, and unlock personalized recommendations.
            </p>
            <SignInButton mode="modal">
              <button
                className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-[12px] font-bold text-fey-black transition-transform active:scale-[0.96]"
                style={{
                  background: "linear-gradient(135deg, #c8a44e, #a0832e)",
                }}
              >
                <Compass size={14} /> Sign In to Get Started
              </button>
            </SignInButton>
          </div>
        </div>
      )}

      {/* Content — only shown for logged-in users */}
      {user && isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
        </div>
      ) : user ? (
        libraryItems.length > 0 ? (
          <MediaGrid
            items={libraryItems}
            onItemClick={setSelectedItem}
          />
        ) : (
          <div className="py-20 text-center">
            <BookOpen size={32} className="mx-auto mb-3 text-cream/10" />
            <p className="text-[13px] font-semibold text-cream/30">
              Your library is empty
            </p>
            <p className="mt-1 text-[11px] text-cream/20">
              Search for anime, games, books, and more to add to your collection.
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}
