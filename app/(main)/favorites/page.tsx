"use client";

import { useState, useMemo } from "react";
import { Heart, Tv, Gamepad2, BookOpen, Monitor, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useAppStore, type MediaItem } from "@/stores/app-store";
import { useFavorites } from "@/hooks/useFavorites";
import { SignInButton, useUser } from "@clerk/nextjs";
import type { MediaType } from "@/lib/constants";

const FILTER_TYPES = [
  { label: "All", value: "all", icon: Heart },
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

export default function FavoritesPage() {
  const { setSelectedItem } = useAppStore();
  const { favorites } = useFavorites();
  const { isSignedIn } = useUser();
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch all carousel data to resolve favorite IDs to full items
  const { data: carousels = [] } = useQuery<CarouselData[]>({
    queryKey: ["home-carousels"],
    queryFn: async () => {
      const res = await fetch("/api/home-carousels");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
  });

  // Build a map of all known media items
  const allItems = useMemo(() => {
    const map = new Map<string, MediaItem>();
    for (const c of carousels) {
      for (const item of c.items) {
        map.set(item.id, item);
      }
    }
    return map;
  }, [carousels]);

  // Resolve favorite IDs to full items
  const favoriteItems = useMemo(() => {
    const items: MediaItem[] = [];
    for (const id of favorites) {
      const item = allItems.get(id);
      if (item) items.push(item);
    }
    return activeFilter === "all"
      ? items
      : items.filter((i) => i.media_type === activeFilter);
  }, [favorites, allItems, activeFilter]);

  return (
    <div className="animate-fadeIn">
      {/* Sync banner */}
      {!isSignedIn && favorites.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-gold/[0.08] bg-gold/[0.03] px-4 py-2.5">
          <span className="text-[12px] text-cream/40">
            Sign in to sync your favorites across devices
          </span>
          <SignInButton mode="modal">
            <button className="text-[12px] font-semibold text-gold hover:text-gold/80 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      )}

      <div className="mb-1 flex items-center gap-2">
        <Heart size={20} className="text-red-400" />
        <h1 className="text-2xl font-extrabold tracking-tight text-cream">
          Favorites
        </h1>
        {favorites.length > 0 && (
          <span className="ml-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-400">
            {favorites.length}
          </span>
        )}
      </div>
      <p className="mb-5 text-[12.5px] text-cream/30">
        Your hearted titles across all media types.
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
                background: isActive ? "rgba(200,164,78,0.1)" : "rgba(255,255,255,0.02)",
                color: isActive ? "#c8a44e" : "rgba(224,218,206,0.35)",
                border: isActive ? "1px solid rgba(200,164,78,0.15)" : "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <Icon size={13} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {favoriteItems.length > 0 ? (
        <MediaGrid items={favoriteItems} onItemClick={setSelectedItem} />
      ) : favorites.length > 0 ? (
        <div className="py-16 text-center">
          <Heart size={32} className="mx-auto mb-3 text-cream/10" />
          <p className="text-[13px] font-semibold text-cream/30">
            No favorites match this filter
          </p>
          <p className="mt-1 text-[11px] text-cream/20">
            Try selecting a different media type above.
          </p>
        </div>
      ) : (
        <div className="py-20 text-center">
          <Heart size={40} className="mx-auto mb-4 text-cream/10" />
          <h3 className="mb-1.5 text-[16px] font-bold text-cream/40">
            No favorites yet
          </h3>
          <p className="mx-auto max-w-[320px] text-[12px] text-cream/25">
            Heart titles from the home page or discover page to add them here.
            Your favorites help power personalized recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
