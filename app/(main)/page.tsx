"use client";

import { useUser } from "@clerk/nextjs";
import { Tv, Gamepad2, BookOpen, Monitor, Film } from "lucide-react";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { useAppStore } from "@/stores/app-store";
import {
  TRENDING_ANIME,
  POPULAR_GAMES,
  RECOMMENDED_BOOKS,
  BINGEWORTHY_TV,
  CLASSIC_FILMS,
} from "@/lib/mock-data";

export default function HomePage() {
  const { user } = useUser();
  const { setSelectedItem } = useAppStore();

  const firstName = user?.firstName || user?.username || "Explorer";

  return (
    <div className="animate-fadeIn">
      <HeroBanner userName={firstName} activeCount={3} />

      {/* Carousels */}
      <div className="space-y-2">
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
      </div>

      {/* Activity + Stats grid */}
      <div className="mt-0.5 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        <ActivityFeed activities={[]} />
        <StatsCards />
      </div>
    </div>
  );
}
