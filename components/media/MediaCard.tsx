"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle, Star, Film } from "lucide-react";
import { MEDIA_TYPES } from "@/lib/constants";
import type { MediaItem } from "@/stores/app-store";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatched } from "@/hooks/useWatched";

interface MediaCardProps {
  item: MediaItem;
  onClick?: () => void;
}

export function MediaCard({ item, onClick }: MediaCardProps) {
  const [hovered, setHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isWatched, toggleWatched } = useWatched();
  const config = MEDIA_TYPES[item.media_type as keyof typeof MEDIA_TYPES];
  const tc = config?.color || "#999";
  const TypeIcon = config?.icon || Film;
  const favorited = isFavorite(item.id);
  const watched = isWatched(item.id);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="group relative cursor-pointer"
      style={{ width: "100%", overflow: "visible" }}
    >
      {/* Inner image container — scale + shadow here, overflow hidden only here */}
      <motion.div
        className="relative aspect-[2/3] rounded-xl overflow-hidden"
        whileHover={{
          scale: 1.05,
          y: -6,
          boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px ${tc}40`,
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        }}
        initial={{
          scale: 1,
          y: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
        whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      >
        {item.cover_image_url ? (
          <Image
            src={item.cover_image_url}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 172px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-fey-surface">
            <TypeIcon size={32} style={{ color: tc, opacity: 0.3 }} />
          </div>
        )}

        {/* Gradient overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: hovered
              ? "linear-gradient(180deg, transparent 15%, rgba(10,10,15,0.96) 100%)"
              : "linear-gradient(180deg, transparent 40%, rgba(10,10,15,0.85) 100%)",
          }}
          transition={{ duration: 0.35 }}
        />

        {/* Type badge */}
        <div
          className="absolute left-[7px] top-[7px] flex items-center gap-[3px] rounded-[5px] px-[7px] py-[2px]"
          style={{
            background: "rgba(10,10,15,0.65)",
            backdropFilter: "blur(6px)",
            border: `1px solid ${tc}25`,
          }}
        >
          <TypeIcon size={9} style={{ color: tc }} />
          <span
            className="text-[8px] font-bold uppercase tracking-[0.5px]"
            style={{ color: tc }}
          >
            {item.media_type}
          </span>
        </div>

        {/* Hover action buttons */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute right-[7px] top-[7px] flex flex-col gap-[3px]"
              style={{ zIndex: 20 }}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Heart / Favorite */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleFavorite(item.id);
                }}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
                style={{
                  background: "rgba(10,10,15,0.65)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Heart
                  size={12}
                  className={favorited ? "fill-red-500 text-red-500" : "text-cream/55"}
                />
              </motion.button>
              {/* Watched / CheckCircle */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleWatched(item.id);
                }}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
                style={{
                  background: "rgba(10,10,15,0.65)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <CheckCircle
                  size={12}
                  className={watched ? "fill-green-500 text-green-500" : "text-cream/55"}
                />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info — inside the card over gradient */}
        <div className="absolute bottom-0 left-0 right-0 px-[9px] pb-[10px] pt-[8px]">
          <h3 className="mb-[3px] text-[12.5px] font-bold leading-tight text-cream line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center gap-[5px] text-[10.5px]">
            {item.year && (
              <span className="text-cream/40">{item.year}</span>
            )}
            {item.rating != null && item.rating > 0 && (
              <span className="flex items-center gap-[2px] text-gold">
                <Star size={9} fill="#c8a44e" />
                <span className="font-bold">
                  {(item.rating / 10).toFixed(1)}
                </span>
              </span>
            )}
            {item.match != null && item.match >= 90 && (
              <span className="text-[9.5px] font-semibold text-match">
                {item.match}%
              </span>
            )}
          </div>
          <AnimatePresence>
            {hovered && item.genres && item.genres.length > 0 && (
              <motion.div
                className="mt-[5px] flex flex-wrap gap-[3px]"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
              >
                {item.genres.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="rounded-[3px] px-[5px] py-[1.5px] text-[8.5px]"
                    style={{
                      background: `${tc}14`,
                      color: tc,
                      border: `1px solid ${tc}1a`,
                    }}
                  >
                    {g}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
