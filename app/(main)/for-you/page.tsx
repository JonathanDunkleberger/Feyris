"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Sparkles,
  TrendingUp,
  Shuffle,
  Heart,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { useAppStore, type MediaItem } from "@/stores/app-store";
import { useMediaStore } from "@/stores/media-store";
import { CatLogo } from "@/components/shared/CatLogo";
import { MEDIA_TYPES, type MediaType } from "@/lib/constants";

const TYPE_COLORS: Record<string, string> = {
  anime: "#7b9ec9",
  game: "#c8a44e",
  book: "#a0c4a8",
  tv: "#c97b9e",
  film: "#d4a574",
  manga: "#b088c9",
};

interface CarouselData {
  key: string;
  title: string;
  type: string;
  items: MediaItem[];
}

export default function ForYouPage() {
  const { setSelectedItem } = useAppStore();
  const favorites = useMediaStore((s) => s.favorites);
  const watched = useMediaStore((s) => s.watched);
  const ratings = useMediaStore((s) => s.ratings);
  const cachedItems = useMediaStore((s) => s.items);
  const [surpriseLoading, setSurpriseLoading] = useState(false);

  const hasFavorites = favorites.length > 0;

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

  // Build a flat pool of all carousel items for Surprise Me
  const allCarouselItems = useMemo(() => {
    const map = new Map<string, MediaItem>();
    for (const c of carousels) {
      for (const item of c.items) {
        map.set(item.id, item);
      }
    }
    return Array.from(map.values());
  }, [carousels]);

  // Pick specific carousels for the "For You" section
  const animeCarousel = carousels.find((c) => c.key === "seasonal-anime" || c.key === "airing-anime");
  const gameCarousel = carousels.find((c) => c.key === "popular-games" || c.key === "new-games");
  const bookCarousel = carousels.find((c) => c.key === "fiction-books" || c.key === "scifi-books");

  // ── Blended "Surprise Mix" carousel ──
  const blendedMix = useMemo(() => {
    if (!hasFavorites || allCarouselItems.length === 0) return [];
    // Shuffle all items and pick up to 20
    const shuffled = [...allCarouselItems].sort(() => Math.random() - 0.5);
    // Exclude items user already favorited/watched
    const excluded = new Set([...favorites, ...watched]);
    return shuffled.filter((i) => !excluded.has(i.id)).slice(0, 20);
  }, [allCarouselItems, favorites, watched, hasFavorites]);

  // ── Surprise Me handler ──
  const handleSurpriseMe = useCallback(() => {
    if (allCarouselItems.length === 0) return;
    setSurpriseLoading(true);
    // Pick a random item, avoid already favorited/watched
    const excluded = new Set([...favorites, ...watched]);
    const candidates = allCarouselItems.filter((i) => !excluded.has(i.id));
    const pool = candidates.length > 0 ? candidates : allCarouselItems;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setTimeout(() => {
      setSelectedItem(pick);
      setSurpriseLoading(false);
    }, 600); // brief delay for fun animation
  }, [allCarouselItems, favorites, watched, setSelectedItem]);

  // ── Taste Profile ──
  const tasteProfile = useMemo(() => {
    const favItems = favorites
      .map((id) => cachedItems[id])
      .filter(Boolean) as MediaItem[];

    if (favItems.length === 0) return null;

    // Type breakdown
    const typeCounts: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    for (const item of favItems) {
      typeCounts[item.media_type] = (typeCounts[item.media_type] || 0) + 1;
      for (const g of item.genres || []) {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      }
    }

    const total = favItems.length;
    const typeBreakdown = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count, percent: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([g]) => g);

    // Average rating
    const ratedItems = Object.values(ratings);
    const avgRating = ratedItems.length > 0
      ? (ratedItems.reduce((a, b) => a + b, 0) / ratedItems.length).toFixed(1)
      : "—";

    return { typeBreakdown, topGenres, avgRating, totalFavorites: favorites.length, totalWatched: watched.length };
  }, [favorites, watched, cachedItems, ratings]);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles size={20} className="text-gold" />
          <h1 className="text-2xl font-extrabold tracking-tight text-cream">
            For You
          </h1>
        </div>
        <p className="text-[12.5px] text-cream/30">
          Personalized recommendations that evolve with your taste.
        </p>
      </div>

      <div className="space-y-6">
        {/* Empty state when no favorites */}
        {!hasFavorites && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-gold/[0.08] p-8 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,18,28,0.9), rgba(14,14,20,0.95))",
            }}
          >
            <CatLogo size={64} className="mx-auto mb-3 opacity-30" />
            <h3 className="mb-1 text-[15px] font-bold text-cream">
              Add Favorites to Get Started
            </h3>
            <p className="mb-3 text-[11px] text-cream/30">
              Heart titles you love to get personalized recommendations that evolve with your taste.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-gold/10 bg-gold/[0.05] px-4 py-2 text-[11px] font-semibold text-gold">
              <Heart size={13} /> Browse the Home page to start
            </div>
          </motion.div>
        )}

        {/* What's Next + Surprise Me */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-gold/[0.08] p-6 text-center"
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
            Get a random recommendation from across all your favorite types.
          </p>
          <motion.button
            onClick={handleSurpriseMe}
            disabled={surpriseLoading || allCarouselItems.length === 0}
            className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-[12px] font-bold text-fey-black disabled:opacity-40"
            style={{
              background:
                "linear-gradient(135deg, #c8a44e, #a0832e)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {surpriseLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Shuffle size={14} />
            )}
            {surpriseLoading ? "Finding..." : "Surprise Me"}
          </motion.button>
        </motion.div>

        {/* Blended Surprise Mix carousel */}
        {blendedMix.length > 0 && (
          <MediaCarousel
            title="Your Surprise Mix"
            items={blendedMix}
            onItemClick={setSelectedItem}
            icon={Shuffle}
            type="anime"
          />
        )}

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

        {/* ── Taste Profile ── */}
        {tasteProfile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-6 rounded-2xl border border-white/[0.04]"
            style={{ background: "rgba(255,255,255,0.015)" }}
          >
            <h3 className="text-lg font-bold text-cream mb-4">Your Taste Profile</h3>

            {/* Type breakdown — horizontal bars */}
            <div className="space-y-3 mb-6">
              {tasteProfile.typeBreakdown.map(({ type, count, percent }) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs w-16 capitalize text-cream/40">{type}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      style={{ backgroundColor: TYPE_COLORS[type] || "#999" }}
                    />
                  </div>
                  <span className="text-xs text-cream/30 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>

            {/* Top genres */}
            {tasteProfile.topGenres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tasteProfile.topGenres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 text-xs rounded-full border"
                    style={{
                      background: "rgba(200,164,78,0.06)",
                      color: "rgba(200,164,78,0.7)",
                      borderColor: "rgba(200,164,78,0.1)",
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-2xl font-black text-gold">{tasteProfile.totalFavorites}</p>
                <p className="text-xs text-cream/30">Favorites</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-2xl font-black text-green-400">{tasteProfile.totalWatched}</p>
                <p className="text-xs text-cream/30">Consumed</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-2xl font-black text-cream">{tasteProfile.avgRating}</p>
                <p className="text-xs text-cream/30">Avg Rating</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
