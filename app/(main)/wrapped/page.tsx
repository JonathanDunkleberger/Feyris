"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CatLogo } from "@/components/shared/CatLogo";
import { WrappedSlideshow } from "@/components/wrapped/WrappedSlideshow";
import type { WrappedData } from "@/stores/app-store";
import type { WrappedPeriod } from "@/lib/constants";

// Demo wrapped data — powered by user's local library stats
const DEMO_DATA: Record<WrappedPeriod, WrappedData> = {
  yearly: {
    period: "yearly",
    period_label: "2025",
    totalHours: 847,
    titlesCompleted: 42,
    topGenre: "Sci-Fi",
    longestStreak: 23,
    personality: "The Worldbuilder",
    personalityDesc:
      "You gravitate toward intricate universes with deep lore. From Elden Ring to Dune, you crave worlds that reward exploration and curiosity.",
    breakdown: [
      { label: "Anime", hours: 312, pct: 37, type: "anime" },
      { label: "Games", hours: 268, pct: 32, type: "game" },
      { label: "Books", hours: 156, pct: 18, type: "book" },
      { label: "TV / Film", hours: 111, pct: 13, type: "tv" },
    ],
    topTitles: [
      { title: "Elden Ring", type: "game", hours: 127 },
      { title: "Attack on Titan", type: "anime", hours: 89 },
      { title: "Dune Series", type: "book", hours: 64 },
      { title: "Baldur's Gate 3", type: "game", hours: 58 },
      { title: "Vinland Saga", type: "anime", hours: 43 },
    ],
    fastestBinge: { title: "Frieren", hours: 12, days: 2 },
    genreExplored: 14,
    avgRating: 8.3,
    topMonth: { month: "March", hours: 112 },
    crossMediumFav: { title: "Cyberpunk: Edgerunners", type: "anime" },
  },
  monthly: {
    period: "monthly",
    period_label: "January 2025",
    totalHours: 68,
    titlesCompleted: 5,
    topGenre: "Fantasy",
    longestStreak: 9,
    personality: "The Marathoner",
    personalityDesc:
      "This month you went deep. Long series, long games, long reads — you committed fully to every title you touched.",
    breakdown: [
      { label: "Games", hours: 32, pct: 47, type: "game" },
      { label: "Anime", hours: 24, pct: 35, type: "anime" },
      { label: "Books", hours: 12, pct: 18, type: "book" },
    ],
    topTitles: [
      { title: "Metaphor: ReFantazio", type: "game", hours: 28 },
      { title: "Solo Leveling S2", type: "anime", hours: 14 },
      { title: "Fourth Wing", type: "book", hours: 12 },
    ],
    fastestBinge: { title: "Solo Leveling S2", hours: 6, days: 1 },
    genreExplored: 5,
    avgRating: 8.7,
    topMonth: undefined,
    crossMediumFav: undefined,
  },
  weekly: {
    period: "weekly",
    period_label: "Week of Jan 6",
    totalHours: 18,
    titlesCompleted: 1,
    topGenre: "RPG",
    longestStreak: 7,
    personality: "The Focused",
    personalityDesc:
      "One week, one mission. You zeroed in on a single experience and gave it everything.",
    breakdown: [
      { label: "Games", hours: 14, pct: 78, type: "game" },
      { label: "Anime", hours: 4, pct: 22, type: "anime" },
    ],
    topTitles: [
      { title: "Metaphor: ReFantazio", type: "game", hours: 14 },
      { title: "Solo Leveling S2", type: "anime", hours: 4 },
    ],
    fastestBinge: undefined,
    genreExplored: 2,
    avgRating: 9.0,
    topMonth: undefined,
    crossMediumFav: undefined,
  },
};

const PERIOD_OPTIONS: { value: WrappedPeriod; label: string }[] = [
  { value: "weekly", label: "Week" },
  { value: "monthly", label: "Month" },
  { value: "yearly", label: "Year" },
];

export default function WrappedPage() {
  const [period, setPeriod] = useState<WrappedPeriod>("yearly");
  const data = DEMO_DATA[period];

  const handleShare = useCallback(() => {
    // Copies current URL — will generate OG share image in a future release
    navigator.clipboard?.writeText(window.location.href);
  }, []);

  return (
    <div className="animate-fadeIn pt-3.5">
      <div className="mb-6 text-center">
        <CatLogo size={38} />
        <h1 className="mt-1.5 text-4xl font-black leading-tight tracking-tight gradient-gold">
          Wrapped {data.period_label}
        </h1>
        <p className="mt-[5px] text-[12.5px] text-cream/30">
          Your {period === "yearly" ? "year" : period === "monthly" ? "month" : "week"} in entertainment, summarized.
        </p>

        {/* Period selector */}
        <div className="mx-auto mt-4 inline-flex rounded-lg border border-white/[0.04] bg-white/[0.02] p-[3px]">
          {PERIOD_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className="relative rounded-md px-4 py-1.5 text-[11.5px] font-semibold transition-colors"
              style={{
                color: period === opt.value ? "#0a0a0f" : "rgba(224,218,206,0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {period === opt.value && (
                <motion.div
                  layoutId="period-pill"
                  className="absolute inset-0 rounded-md"
                  style={{ background: "linear-gradient(135deg, #c8a44e, #a0832e)" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <WrappedSlideshow data={data} onShare={handleShare} />
    </div>
  );
}
