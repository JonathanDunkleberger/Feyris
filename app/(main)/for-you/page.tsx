"use client";

import { motion } from "framer-motion";
import {
  Wand2,
  Star,
  Sparkles,
  TrendingUp,
  Shuffle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { TasteRadar } from "@/components/recommendations/TasteRadar";
import { useAppStore, type MediaItem } from "@/stores/app-store";
import type { MediaType } from "@/lib/constants";

// Demo data for taste radar
const DEMO_TASTE = [
  { dimension: "Action", value: 8 },
  { dimension: "Sci-Fi", value: 9 },
  { dimension: "Romance", value: 3 },
  { dimension: "Horror", value: 5 },
  { dimension: "Comedy", value: 6 },
  { dimension: "Drama", value: 7 },
  { dimension: "Fantasy", value: 9 },
  { dimension: "Mystery", value: 4 },
];

interface CarouselData {
  key: string;
  title: string;
  type: string;
  items: MediaItem[];
}

export default function ForYouPage() {
  const { setSelectedItem } = useAppStore();

  // Fetch real carousels to power the recommendation sections
  const { data: carousels = [] } = useQuery<CarouselData[]>({
    queryKey: ["home-carousels"],
    queryFn: async () => {
      const res = await fetch("/api/home-carousels");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
  });

  // Pick specific carousels for the "For You" section
  const animeCarousel = carousels.find((c) => c.key === "seasonal-anime" || c.key === "airing-anime");
  const gameCarousel = carousels.find((c) => c.key === "popular-games" || c.key === "new-games");
  const bookCarousel = carousels.find((c) => c.key === "fiction-books" || c.key === "scifi-books");

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <Wand2 size={20} className="text-gold" />
          <h1 className="text-2xl font-extrabold tracking-tight text-cream">
            For You
          </h1>
        </div>
        <p className="text-[12.5px] text-cream/30">
          Personalized recommendations that evolve with your taste.
        </p>
      </div>

      <div className="space-y-6">
        {/* Taste radar + What's Next */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <div>
            {/* What's Next Picker */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 rounded-xl border border-gold/[0.08] p-6 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20,18,28,0.9), rgba(14,14,20,0.95))",
              }}
            >
              <Sparkles size={24} className="mx-auto mb-2 text-gold" />
              <h3 className="mb-1 text-[15px] font-bold text-cream">
                What Should I Try Next?
              </h3>
              <p className="mb-4 text-[11px] text-cream/30">
                Get a random recommendation from across all your favorite
                types.
              </p>
              <motion.button
                className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-[12px] font-bold text-fey-black"
                style={{
                  background:
                    "linear-gradient(135deg, #c8a44e, #a0832e)",
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Shuffle size={14} /> Surprise Me
              </motion.button>
            </motion.div>

            {/* Recommendation carousels — real API data */}
            {animeCarousel && (
              <MediaCarousel
                title="Because You Love Sci-Fi"
                items={animeCarousel.items}
                onItemClick={setSelectedItem}
                icon={Star}
                type={animeCarousel.type as MediaType}
              />
            )}
            {gameCarousel && (
              <MediaCarousel
                title="Cross-Medium Picks"
                items={gameCarousel.items}
                onItemClick={setSelectedItem}
                icon={TrendingUp}
                type={gameCarousel.type as MediaType}
              />
            )}
            {bookCarousel && (
              <MediaCarousel
                title="Trending in Your Genres"
                items={bookCarousel.items}
                onItemClick={setSelectedItem}
                icon={Sparkles}
                type={bookCarousel.type as MediaType}
              />
            )}
          </div>

          {/* Sidebar */}
          <div>
            <TasteRadar data={DEMO_TASTE} />
          </div>
        </div>
      </div>
    </div>
  );
}
