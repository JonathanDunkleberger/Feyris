"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { Tv, Gamepad2, BookOpen, Monitor, Film, Flame, Trophy, Sparkles, Zap, Rocket } from "lucide-react";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { useAppStore, type MediaItem } from "@/stores/app-store";
import type { MediaType } from "@/lib/constants";

/* Icon map per media type */
const ICON_MAP: Record<string, typeof Tv> = {
  anime: Tv,
  game: Gamepad2,
  book: BookOpen,
  tv: Monitor,
  film: Film,
};

/* Extra icons per carousel key for variety */
const CAROUSEL_ICON: Record<string, typeof Tv> = {
  "trending-movies": Flame,
  "trending-tv": Flame,
  "seasonal-anime": Sparkles,
  "airing-anime": Zap,
  "popular-games": Gamepad2,
  "new-games": Rocket,
  "fiction-books": BookOpen,
  "scifi-books": Rocket,
  "top-rated-films": Trophy,
  "on-air-tv": Monitor,
  "top-rated-games": Trophy,
  "action-anime": Zap,
};

interface CarouselData {
  key: string;
  title: string;
  type: string;
  items: MediaItem[];
}

export default function HomePage() {
  const { user } = useUser();
  const { setSelectedItem } = useAppStore();

  const firstName = user?.firstName || user?.username || "Explorer";

  const { data: carousels = [], isLoading } = useQuery<CarouselData[]>({
    queryKey: ["home-carousels"],
    queryFn: async () => {
      const res = await fetch("/api/home-carousels");
      if (!res.ok) throw new Error("Failed to fetch carousels");
      return res.json();
    },
    staleTime: 30 * 60 * 1000, // 30 min
    refetchOnWindowFocus: false,
  });

  return (
    <div className="animate-fadeIn">
      <HeroBanner userName={firstName} activeCount={3} />

      {/* Carousels */}
      <div className="space-y-2">
        {isLoading ? (
          /* Skeleton loaders while data loads */
          Array.from({ length: 4 }).map((_, i) => (
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
              icon={CAROUSEL_ICON[c.key] || ICON_MAP[c.type] || Sparkles}
              type={c.type as MediaType}
            />
          ))
        )}
      </div>

      {/* Activity + Stats grid */}
      <div className="mt-0.5 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        <ActivityFeed activities={[]} />
        <StatsCards />
      </div>
    </div>
  );
}
