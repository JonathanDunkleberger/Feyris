"use client";

import { useUser } from "@clerk/nextjs";
import { Tv, Gamepad2, BookOpen, Sparkles } from "lucide-react";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CurrentlyConsuming } from "@/components/media/CurrentlyConsuming";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { useAppStore } from "@/stores/app-store";
import { useLibrary, useInProgressMedia } from "@/hooks/useLibrary";
import { useActivity } from "@/hooks/useActivity";

export default function HomePage() {
  const { user } = useUser();
  const { setSelectedItem } = useAppStore();
  const { data: inProgress } = useInProgressMedia();
  const { data: activity } = useActivity();

  const firstName = user?.firstName || user?.username || "Explorer";

  return (
    <div className="animate-fadeIn">
      <HeroBanner
        userName={firstName}
        activeCount={inProgress?.length || 0}
      />

      {/* Currently consuming */}
      {inProgress && inProgress.length > 0 && (
        <CurrentlyConsuming
          entries={inProgress}
          onItemClick={(entry) => {
            if (entry.media) setSelectedItem(entry.media);
          }}
        />
      )}

      {/* Carousels — these will be populated when API routes are ready */}
      {/* For now showing placeholder sections */}
      <div className="space-y-2">
        <MediaCarousel
          title="Trending Anime"
          items={[]}
          onItemClick={setSelectedItem}
          icon={Tv}
          type="anime"
        />
        <MediaCarousel
          title="Popular Games"
          items={[]}
          onItemClick={setSelectedItem}
          icon={Gamepad2}
          type="game"
        />
        <MediaCarousel
          title="Recommended Books"
          items={[]}
          onItemClick={setSelectedItem}
          icon={BookOpen}
          type="book"
        />
      </div>

      {/* Activity + Stats grid */}
      <div className="mt-0.5 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        <ActivityFeed activities={activity || []} />
        <StatsCards />
      </div>
    </div>
  );
}
