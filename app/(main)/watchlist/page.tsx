"use client";

import { useState, useMemo } from "react";
import { Clock, Tv, Gamepad2, BookOpen, Monitor, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useAppStore, type MediaItem } from "@/stores/app-store";
import { useWatchlist } from "@/hooks/useWatchlist";
import { SignInButton, useUser } from "@clerk/nextjs";

const FILTER_TYPES = [
  { label: "All", value: "all", icon: Clock },
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

export default function WatchlistPage() {
  const { setSelectedItem } = useAppStore();
  const { watchlist } = useWatchlist();
  const { isSignedIn } = useUser();
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: carousels = [] } = useQuery<CarouselData[]>({
    queryKey: ["home-carousels"],
    queryFn: async () => {
      const res = await fetch("/api/home-carousels");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
  });

  const allItems = useMemo(() => {
    const map = new Map<string, MediaItem>();
    for (const c of carousels) {
      for (const item of c.items) {
        map.set(item.id, item);
      }
    }
    return map;
  }, [carousels]);

  const watchlistItems = useMemo(() => {
    const items: MediaItem[] = [];
    for (const id of watchlist) {
      const item = allItems.get(id);
      if (item) items.push(item);
    }
    return activeFilter === "all"
      ? items
      : items.filter((i) => i.media_type === activeFilter);
  }, [watchlist, allItems, activeFilter]);

  return (
    <div className="animate-fadeIn">
      {/* Sync banner */}
      {!isSignedIn && watchlist.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-gold/[0.08] bg-gold/[0.03] px-4 py-2.5">
          <span className="text-[12px] text-cream/40">
            Sign in to sync your watchlist across devices
          </span>
          <SignInButton mode="modal">
            <button className="text-[12px] font-semibold text-gold hover:text-gold/80 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      )}

      <div className="mb-1 flex items-center gap-2">
        <Clock size={20} className="text-[#c8a44e]" />
        <h1 className="text-2xl font-extrabold tracking-tight text-cream">
          Watchlist
        </h1>
        {watchlist.length > 0 && (
          <span className="ml-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">
            {watchlist.length}
          </span>
        )}
      </div>
      <p className="mb-5 text-[12.5px] text-cream/30">
        Titles you plan to watch, play, or read.
      </p>

      {/* Type filter */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {FILTER_TYPES.map((f) => {
          const Icon = f.icon;
          const isActive = activeFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-all"
              style={{
                background: isActive
                  ? "rgba(200,164,78,0.1)"
                  : "rgba(255,255,255,0.02)",
                color: isActive ? "#c8a44e" : "rgba(224,218,206,0.35)",
                border: isActive
                  ? "1px solid rgba(200,164,78,0.15)"
                  : "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <Icon size={13} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {watchlistItems.length > 0 ? (
        <MediaGrid items={watchlistItems} onItemClick={setSelectedItem} />
      ) : watchlist.length > 0 ? (
        <div className="py-16 text-center">
          <Clock size={32} className="mx-auto mb-3 text-cream/10" />
          <p className="text-[13px] font-semibold text-cream/30">
            No items match this filter
          </p>
          <p className="mt-1 text-[11px] text-cream/20">
            Try selecting a different media type above.
          </p>
        </div>
      ) : (
        <div className="py-20 text-center">
          <Clock size={40} className="mx-auto mb-4 text-cream/10" />
          <h3 className="mb-1.5 text-[16px] font-bold text-cream/40">
            Your watchlist is empty
          </h3>
          <p className="mx-auto max-w-[320px] text-[12px] text-cream/25">
            Add titles to your watchlist from any media page. Keep track of
            everything you want to watch, play, or read.
          </p>
        </div>
      )}
    </div>
  );
}
