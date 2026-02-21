"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wand2,
  Lock,
  Star,
  Zap,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Shuffle,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { TasteRadar } from "@/components/recommendations/TasteRadar";
import { EmptyState } from "@/components/shared/EmptyState";
import { CatLogo } from "@/components/shared/CatLogo";
import { FOR_YOU_THRESHOLDS } from "@/lib/constants";
import type { MediaItem } from "@/stores/app-store";

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

export default function ForYouPage() {
  const { userId } = useAuth();
  const [ratedCount] = useState(0); // In production, fetch from API

  // Determine unlock level
  const currentThreshold = FOR_YOU_THRESHOLDS.reduce(
    (acc, t) => (ratedCount >= t.min ? t : acc),
    FOR_YOU_THRESHOLDS[0]
  );
  const nextThreshold = FOR_YOU_THRESHOLDS.find((t) => t.min > ratedCount);
  const progress = nextThreshold
    ? ((ratedCount - (currentThreshold?.min || 0)) / (nextThreshold.min - (currentThreshold?.min || 0))) * 100
    : 100;

  const isUnlocked = ratedCount >= 5; // Cross-medium recs unlock at 5 ratings

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

      {/* Unlock progress */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-xl border border-gold/[0.08] p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(20,18,28,0.9), rgba(14,14,20,0.95))",
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-gold" />
            <span className="text-[12px] font-bold text-cream">
              {currentThreshold.label}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gold">
            {ratedCount} ratings
          </span>
        </div>
        <p className="mb-3 text-[11px] text-cream/35">
          {currentThreshold.description}
        </p>

        {/* Progress bar */}
        <div className="h-[6px] overflow-hidden rounded-full bg-white/[0.04]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #8a7235, #c8a44e, #e8d5a0)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {nextThreshold && (
          <div className="mt-2 flex items-center justify-between text-[9.5px] text-cream/20">
            <span>
              {ratedCount} / {nextThreshold.min} ratings
            </span>
            <span className="flex items-center gap-1">
              <Lock size={9} /> Next: {nextThreshold.label}
            </span>
          </div>
        )}

        {/* Unlock milestones */}
        <div className="mt-3 flex gap-1">
          {FOR_YOU_THRESHOLDS.map((t) => (
            <div
              key={t.min}
              className="flex-1 rounded-sm h-1"
              style={{
                background:
                  ratedCount >= t.min
                    ? "rgba(200,164,78,0.4)"
                    : "rgba(255,255,255,0.04)",
              }}
            />
          ))}
        </div>
      </motion.div>

      {isUnlocked ? (
        <div className="space-y-6">
          {/* Taste radar */}
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

              {/* Recommendation carousels */}
              <MediaCarousel
                title="Because You Love Sci-Fi"
                items={[]}
                icon={Star}
                type="anime"
              />
              <MediaCarousel
                title="Cross-Medium Picks"
                items={[]}
                icon={TrendingUp}
                type="game"
              />
              <MediaCarousel
                title="Trending in Your Genres"
                items={[]}
                icon={Sparkles}
                type="book"
              />
            </div>

            {/* Sidebar */}
            <div>
              <TasteRadar data={DEMO_TASTE} />
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Lock}
          title="Unlock Your Recommendations"
          description={`Rate at least 5 items to unlock personalized cross-medium recommendations. You've rated ${ratedCount} so far.`}
          action={{
            label: "Browse & Rate",
            onClick: () => {},
          }}
        />
      )}
    </div>
  );
}
