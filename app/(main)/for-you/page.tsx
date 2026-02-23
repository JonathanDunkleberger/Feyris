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

  // Build a flat pool of all items available on the page for Surprise Me
  // Priority: carousel data from API, then cached items from the store
  const allItems = useMemo(() => {
    const map = new Map<string, MediaItem>();
    // 1) Items from loaded carousels
    for (const c of carousels) {
      for (const item of c.items) {
        map.set(item.id, item);
      }
    }
    // 2) Fallback: cached items from the unified store (items the user has interacted with)
    for (const [id, item] of Object.entries(cachedItems)) {
      if (!map.has(id)) map.set(id, item);
    }
    return Array.from(map.values());
  }, [carousels, cachedItems]);

  // Items the user has already consumed — filter these from recommendations
  const consumedSet = useMemo(
    () => new Set([...favorites, ...watched, ...Object.keys(ratings)]),
    [favorites, watched, ratings]
  );

  // Pick specific carousels for the "For You" section and filter consumed items
  const animeCarousel = useMemo(() => {
    const c = carousels.find((c) => c.key === "seasonal-anime" || c.key === "airing-anime");
    if (!c) return null;
    return { ...c, items: c.items.filter((i) => !consumedSet.has(i.id)) };
  }, [carousels, consumedSet]);

  const gameCarousel = useMemo(() => {
    const c = carousels.find((c) => c.key === "popular-games" || c.key === "new-games");
    if (!c) return null;
    return { ...c, items: c.items.filter((i) => !consumedSet.has(i.id)) };
  }, [carousels, consumedSet]);

  const bookCarousel = useMemo(() => {
    const c = carousels.find((c) => c.key === "fiction-books" || c.key === "scifi-books");
    if (!c) return null;
    return { ...c, items: c.items.filter((i) => !consumedSet.has(i.id)) };
  }, [carousels, consumedSet]);

  // ── Blended "Surprise Mix" carousel ──
  const blendedMix = useMemo(() => {
    if (allItems.length === 0) return [];
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);
    const excluded = new Set([...favorites, ...watched]);
    return shuffled.filter((i) => !excluded.has(i.id)).slice(0, 20);
  }, [allItems, favorites, watched]);

  // ── Surprise Me handler — picks a random item from already-loaded page data ──
  const handleSurpriseMe = useCallback(() => {
    if (allItems.length === 0) return;
    setSurpriseLoading(true);
    // Prefer items the user hasn't favorited/watched yet
    const excluded = new Set([...favorites, ...watched]);
    const candidates = allItems.filter((i) => !excluded.has(i.id));
    const pool = candidates.length > 0 ? candidates : allItems;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setTimeout(() => {
      if (pick) setSelectedItem(pick);
      setSurpriseLoading(false);
    }, 600);
  }, [allItems, favorites, watched, setSelectedItem]);

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

  // Generate dynamic carousel titles based on user's taste profile
  const getCarouselTitle = useCallback((type: string) => {
    if (!tasteProfile || tasteProfile.topGenres.length === 0) {
      const fallbacks: Record<string, string> = {
        anime: "Trending Anime",
        game: "Popular Games",
        book: "Books You Might Like",
      };
      return fallbacks[type] || "Recommended for You";
    }
    // Pick a genre the user likes that's relevant to this type
    const typeGenres: Record<string, string[]> = {
      anime: ["Action", "Fantasy", "Sci-Fi", "Drama", "Adventure", "Comedy"],
      game: ["Action", "RPG", "Adventure", "Strategy", "Shooter", "Puzzle"],
      book: ["Fiction", "Fantasy", "Sci-Fi", "Mystery", "Romance", "Thriller"],
    };
    const relevant = typeGenres[type] || [];
    const match = tasteProfile.topGenres.find((g) => relevant.some((r) => g.toLowerCase().includes(r.toLowerCase())));
    if (match) return `Because You Love ${match}`;
    return `Recommended ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }, [tasteProfile]);

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
            disabled={surpriseLoading || allItems.length === 0}
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

        {/* Recommendation carousels — real API data, filtered */}
        {animeCarousel && animeCarousel.items.length > 0 && (
          <MediaCarousel
            title={getCarouselTitle("anime")}
            items={animeCarousel.items}
            onItemClick={setSelectedItem}
            icon={Star}
            type={animeCarousel.type as MediaType}
          />
        )}
        {gameCarousel && gameCarousel.items.length > 0 && (
          <MediaCarousel
            title={getCarouselTitle("game")}
            items={gameCarousel.items}
            onItemClick={setSelectedItem}
            icon={TrendingUp}
            type={gameCarousel.type as MediaType}
          />
        )}
        {bookCarousel && bookCarousel.items.length > 0 && (
          <MediaCarousel
            title={getCarouselTitle("book")}
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
