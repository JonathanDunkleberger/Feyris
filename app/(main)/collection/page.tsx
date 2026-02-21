"use client";

import { useState, useMemo } from "react";
import {
  Heart,
  CheckCircle,
  Clock,
  Tv,
  Gamepad2,
  BookOpen,
  Monitor,
  Film,
  BookMarked,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useAppStore, type MediaItem } from "@/stores/app-store";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatched } from "@/hooks/useWatched";
import { useWatchlist } from "@/hooks/useWatchlist";
import { SignInButton, useUser } from "@clerk/nextjs";

const LIST_TABS = [
  { key: "favorites", label: "Favorites", icon: Heart, color: "#f87171" },
  { key: "watched", label: "Watched", icon: CheckCircle, color: "#4ade80" },
  { key: "watchlist", label: "Watchlist", icon: Clock, color: "#c8a44e" },
] as const;

const MEDIA_FILTERS = [
  { label: "All", value: "all" },
  { label: "Anime", value: "anime", icon: Tv },
  { label: "Games", value: "game", icon: Gamepad2 },
  { label: "Books", value: "book", icon: BookOpen },
  { label: "TV", value: "tv", icon: Monitor },
  { label: "Films", value: "film", icon: Film },
] as const;

interface CarouselData {
  key: string;
  title: string;
  type: string;
  items: MediaItem[];
}

export default function CollectionPage() {
  const { setSelectedItem } = useAppStore();
  const { favorites } = useFavorites();
  const { watched } = useWatched();
  const { watchlist } = useWatchlist();
  const { isSignedIn } = useUser();
  const [activeList, setActiveList] = useState<"favorites" | "watched" | "watchlist">("favorites");
  const [mediaFilter, setMediaFilter] = useState("all");

  // Fetch carousel data to resolve IDs to full items
  const { data: carousels = [] } = useQuery<CarouselData[]>({
    queryKey: ["home-carousels"],
    queryFn: async () => {
      const res = await fetch("/api/home-carousels");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
  });

  // Build map of all known items
  const allItems = useMemo(() => {
    const map = new Map<string, MediaItem>();
    for (const c of carousels) {
      for (const item of c.items) {
        map.set(item.id, item);
      }
    }
    return map;
  }, [carousels]);

  // Get the right ID list
  const activeIds = activeList === "favorites" ? favorites : activeList === "watched" ? watched : watchlist;

  // Resolve IDs to items + apply filter
  const displayItems = useMemo(() => {
    const items: MediaItem[] = [];
    for (const id of activeIds) {
      const item = allItems.get(id);
      if (item) items.push(item);
    }
    return mediaFilter === "all"
      ? items
      : items.filter((i) => i.media_type === mediaFilter);
  }, [activeIds, allItems, mediaFilter]);

  // Counts per list
  const counts = {
    favorites: favorites.length,
    watched: watched.length,
    watchlist: watchlist.length,
  };

  const totalItems = counts.favorites + counts.watched + counts.watchlist;

  const activeTab = LIST_TABS.find((t) => t.key === activeList)!;

  return (
    <div className="animate-fadeIn">
      {/* Sync banner */}
      {!isSignedIn && totalItems > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-gold/[0.08] bg-gold/[0.03] px-4 py-2.5">
          <span className="text-[12px] text-cream/40">
            Sign in to sync your collection across devices
          </span>
          <SignInButton mode="modal">
            <button className="text-[12px] font-semibold text-gold hover:text-gold/80 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      )}

      {/* Header */}
      <div className="mb-1 flex items-center gap-2">
        <BookMarked size={20} className="text-gold" />
        <h1 className="text-2xl font-extrabold tracking-tight text-cream">
          My Media
        </h1>
        {totalItems > 0 && (
          <span className="ml-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">
            {totalItems}
          </span>
        )}
      </div>
      <p className="mb-5 text-[12.5px] text-cream/30">
        Your favorites, watched items, and watchlist — all in one place.
      </p>

      {/* List tabs */}
      <div className="mb-4 flex gap-1.5">
        {LIST_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeList === tab.key;
          const count = counts[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveList(tab.key as typeof activeList);
                setMediaFilter("all");
              }}
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-all"
              style={{
                background: isActive
                  ? `${tab.color}12`
                  : "rgba(255,255,255,0.02)",
                color: isActive ? tab.color : "rgba(224,218,206,0.35)",
                border: isActive
                  ? `1px solid ${tab.color}25`
                  : "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <Icon size={14} />
              {tab.label}
              {count > 0 && (
                <span
                  className="ml-0.5 rounded-full px-1.5 py-[1px] text-[10px] font-bold"
                  style={{
                    background: isActive ? `${tab.color}18` : "rgba(255,255,255,0.04)",
                    color: isActive ? tab.color : "rgba(224,218,206,0.25)",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Media type filter */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {MEDIA_FILTERS.map((f) => {
          const isActive = mediaFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setMediaFilter(f.value)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all"
              style={{
                background: isActive
                  ? "rgba(200,164,78,0.1)"
                  : "rgba(255,255,255,0.02)",
                color: isActive ? "#c8a44e" : "rgba(224,218,206,0.3)",
                border: isActive
                  ? "1px solid rgba(200,164,78,0.15)"
                  : "1px solid rgba(255,255,255,0.03)",
              }}
            >
              {"icon" in f && f.icon && <f.icon size={12} />}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {displayItems.length > 0 ? (
        <MediaGrid items={displayItems} onItemClick={setSelectedItem} />
      ) : activeIds.length > 0 ? (
        <div className="py-16 text-center">
          <activeTab.icon size={32} className="mx-auto mb-3 text-cream/10" />
          <p className="text-[13px] font-semibold text-cream/30">
            No items match this filter
          </p>
          <p className="mt-1 text-[11px] text-cream/20">
            Try selecting a different media type above.
          </p>
        </div>
      ) : (
        <div className="py-20 text-center">
          <activeTab.icon size={40} className="mx-auto mb-4 text-cream/10" />
          <h3 className="mb-1.5 text-[16px] font-bold text-cream/40">
            {activeList === "favorites"
              ? "No favorites yet"
              : activeList === "watched"
              ? "Your library is empty"
              : "Your watchlist is empty"}
          </h3>
          <p className="mx-auto max-w-[320px] text-[12px] text-cream/25">
            {activeList === "favorites"
              ? "Heart titles from any page to add them to your favorites."
              : activeList === "watched"
              ? "Mark titles as watched to build your library."
              : "Add titles to your watchlist to track what you want to experience next."}
          </p>
        </div>
      )}
    </div>
  );
}
