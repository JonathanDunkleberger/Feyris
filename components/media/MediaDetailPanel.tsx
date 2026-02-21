"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Star,
  TrendingUp,
  Heart,
  CheckCircle,
  User,
  Film,
  ChevronDown,
  ExternalLink,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MEDIA_TYPES } from "@/lib/constants";
import type { MediaItem } from "@/stores/app-store";
import { useAppStore } from "@/stores/app-store";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatched } from "@/hooks/useWatched";
import { useRatings } from "@/hooks/useRatings";
import { useReviews, type ReviewItem } from "@/hooks/useReviews";
import { RatingSlider } from "@/components/reviews/RatingInput";

// ─── Helpers ────────────────────────────────────────────────────────────────
function getWatchLabel(type: string) {
  switch (type) {
    case "game":
      return "Mark as Played";
    case "book":
      return "Mark as Read";
    default:
      return "Mark as Watched";
  }
}

function getWatchedLabel(type: string) {
  switch (type) {
    case "game":
      return "Played";
    case "book":
      return "Read";
    default:
      return "Watched";
  }
}

function getRatingSource(mediaType: string): string {
  switch (mediaType) {
    case "anime":
    case "manga":
      return "MAL";
    case "game":
      return "IGDB";
    case "book":
      return "Google";
    default:
      return "TMDB";
  }
}

// ─── Component ──────────────────────────────────────────────────────────────
export function MediaDetailPanel() {
  const { selectedItem, setSelectedItem } = useAppStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isWatched, toggleWatched } = useWatched();
  const { getRating, setRating } = useRatings();
  const { getReviews, addReview } = useReviews();
  const [showReviews, setShowReviews] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [ratingMode, setRatingMode] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedItem(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelectedItem]);

  // Reset local state when item changes
  useEffect(() => {
    setShowReviews(false);
    setShowFullDescription(false);
    setRatingMode(false);
    setReviewText("");
    setReviewRating(0);
  }, [selectedItem?.id]);

  if (!selectedItem) return null;

  const item = selectedItem;
  const config = MEDIA_TYPES[item.media_type as keyof typeof MEDIA_TYPES];
  const tc = config?.color || "#999";
  const TypeIcon = config?.icon || Film;
  const favorited = isFavorite(item.id);
  const watched = isWatched(item.id);
  const userRating = getRating(item.id);
  const reviews = getReviews(item.id);
  const ratingSource = getRatingSource(item.media_type);

  const onClose = () => setSelectedItem(null);

  const descriptionLong = (item.description?.length || 0) > 250;
  const displayDescription = showFullDescription
    ? item.description
    : item.description?.slice(0, 250);

  // Metadata line based on media type
  const metaLine = (() => {
    const parts: string[] = [];
    if (item.author) parts.push(item.author);
    if (item.runtime) {
      if (item.media_type === "film") parts.push(`${item.runtime} min`);
      else if (item.media_type === "anime" || item.media_type === "tv")
        parts.push(`${item.runtime} episodes`);
      else if (item.media_type === "book") parts.push(`${item.runtime} pages`);
    }
    if (item.status_text) parts.push(item.status_text);
    return parts;
  })();

  const handleSubmitReview = () => {
    if (!reviewText.trim() || reviewRating <= 0) return;
    addReview(item.id, {
      user: "You",
      rating: reviewRating,
      text: reviewText.trim(),
    });
    setReviewText("");
    setReviewRating(0);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center animate-fadeIn"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[94%] max-w-3xl overflow-y-auto animate-slideUp"
        style={{
          maxHeight: "92vh",
          background:
            "linear-gradient(160deg, rgba(20,20,28,0.96), rgba(12,12,18,0.98))",
          borderRadius: 20,
          border: "1px solid rgba(200,164,78,0.08)",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
          backdropFilter: "blur(40px)",
          scrollbarWidth: "none",
        }}
      >
        {/* ─── 1. HERO SECTION ─────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{ height: 280, borderRadius: "20px 20px 0 0" }}
        >
          {item.backdrop_image_url || item.cover_image_url ? (
            <Image
              src={item.backdrop_image_url || item.cover_image_url!}
              alt={item.title}
              fill
              className="object-cover"
              sizes="900px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-fey-surface">
              <TypeIcon size={56} style={{ color: tc, opacity: 0.2 }} />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(12,12,18,0.99) 92%)",
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-cream transition-colors hover:bg-white/10"
            style={{
              background: "rgba(10,10,15,0.55)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <X size={16} />
          </button>

          {/* Title area */}
          <div className="absolute bottom-[20px] left-[24px] right-[24px]">
            <div className="mb-2 flex items-center gap-2">
              <div
                className="flex items-center gap-[3px] rounded-[5px] px-2 py-[3px]"
                style={{
                  background: `${tc}15`,
                  border: `1px solid ${tc}22`,
                }}
              >
                <TypeIcon size={11} style={{ color: tc }} />
                <span
                  className="text-[9.5px] font-bold uppercase"
                  style={{ color: tc }}
                >
                  {config?.label || item.media_type}
                </span>
              </div>
              {item.year && (
                <span className="text-[12px] text-cream/45">{item.year}</span>
              )}
            </div>
            <h2 className="text-[28px] font-extrabold leading-tight tracking-tight text-cream">
              {item.title}
            </h2>
            {item.original_title && item.original_title !== item.title && (
              <div className="mt-0.5 text-[12px] italic text-cream/30">
                {item.original_title}
              </div>
            )}

            {/* ─── Dual Ratings ─────────────────────────────── */}
            <div className="mt-2 flex items-center gap-4">
              {item.rating != null && item.rating > 0 && (
                <span className="flex items-center gap-1 text-cream/50">
                  <span className="text-[10px] font-semibold uppercase text-cream/35">
                    {ratingSource}
                  </span>
                  <Star
                    size={12}
                    className="fill-yellow-500 text-yellow-500"
                  />
                  <span className="text-[14px] font-extrabold text-cream/60">
                    {(item.rating / 10).toFixed(1)}
                  </span>
                </span>
              )}
              {userRating > 0 && (
                <span className="flex items-center gap-1 text-gold">
                  <span className="text-[10px] font-semibold uppercase text-gold/60">
                    Feyris
                  </span>
                  <Star size={12} className="fill-[#c8a44e] text-[#c8a44e]" />
                  <span className="text-[14px] font-extrabold">
                    {userRating}
                  </span>
                </span>
              )}
              {item.match != null && item.match > 0 && (
                <span className="flex items-center gap-1 text-[12px] font-semibold text-match">
                  <TrendingUp size={13} /> {item.match}% Match
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-[24px] pb-[24px] pt-[16px]">
          {/* ─── 2. METADATA ROW ────────────────────────────────────────── */}
          {metaLine.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-cream/45">
              <User size={12} className="text-cream/25" />
              {metaLine.map((part, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && (
                    <span className="text-cream/15">&middot;</span>
                  )}
                  <span className="text-cream/60">{part}</span>
                </span>
              ))}
            </div>
          )}

          {/* ─── 3. GENRES ──────────────────────────────────────────────── */}
          {item.genres && item.genres.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-[6px]">
              {item.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-[6px] px-[10px] py-[4px] text-[11px] font-medium"
                  style={{
                    background: `${tc}0c`,
                    color: tc,
                    border: `1px solid ${tc}15`,
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* ─── 4. DESCRIPTION ─────────────────────────────────────────── */}
          {item.description && (
            <div className="mb-4">
              <p className="text-[13px] leading-[1.75] text-cream/55">
                {displayDescription}
                {descriptionLong && !showFullDescription && "..."}
              </p>
              {descriptionLong && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-1 text-[11px] font-semibold text-gold/60 hover:text-gold transition-colors"
                >
                  {showFullDescription ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}

          {/* ─── 5. TWO ACTION BUTTONS ──────────────────────────────────── */}
          <div className="mb-5 flex gap-3">
            <button
              onClick={() => toggleFavorite(item.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all ${
                favorited
                  ? "border border-red-500/30 bg-red-500/[0.12] text-red-400"
                  : "border border-white/[0.06] bg-white/[0.04] text-cream/60 hover:bg-white/[0.07]"
              }`}
            >
              <Heart
                size={16}
                className={favorited ? "fill-red-400" : ""}
              />
              {favorited ? "Favorited" : "Favorite"}
            </button>

            <button
              onClick={() => toggleWatched(item.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all ${
                watched
                  ? "border border-green-500/30 bg-green-500/[0.12] text-green-400"
                  : "border border-white/[0.06] bg-white/[0.04] text-cream/60 hover:bg-white/[0.07]"
              }`}
            >
              <CheckCircle
                size={16}
                className={watched ? "fill-green-400" : ""}
              />
              {watched
                ? getWatchedLabel(item.media_type)
                : getWatchLabel(item.media_type)}
            </button>
          </div>

          {/* ─── 6. RATE THIS ───────────────────────────────────────────── */}
          <div className="mb-5">
            <button
              onClick={() => setRatingMode(!ratingMode)}
              className="flex items-center gap-1.5 text-[12px] font-bold text-cream/40 hover:text-cream/60 transition-colors"
            >
              <Star size={14} />
              {userRating > 0
                ? `Your rating: ${userRating}/10`
                : "Rate this"}
              <ChevronDown
                size={12}
                className={`transition-transform ${ratingMode ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {ratingMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-hidden rounded-xl border border-gold/10 bg-gold/[0.03] p-4"
                >
                  <RatingSlider
                    value={userRating}
                    onChange={(v) => setRating(item.id, v)}
                    label="Your Rating"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── 7. WHERE TO WATCH/PLAY/BUY ─────────────────────────────── */}
          {item.where_to_watch && item.where_to_watch.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-cream/30">
                Where to Watch
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.where_to_watch.map((w, i) => (
                  <a
                    key={i}
                    href={w.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-cream/60 transition-colors hover:bg-white/[0.06]"
                  >
                    {w.logo_url && (
                      <Image
                        src={w.logo_url}
                        alt={w.provider}
                        width={20}
                        height={20}
                        className="rounded-[3px]"
                      />
                    )}
                    {w.provider}
                    <ExternalLink size={10} className="text-cream/25" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ─── 8. TRAILERS & VIDEOS ───────────────────────────────────── */}
          {item.videos && item.videos.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-cream/30">
                Videos
              </h3>
              <div
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {item.videos.slice(0, 6).map((v) => (
                  <a
                    key={v.id}
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/vid relative flex-shrink-0 overflow-hidden rounded-lg"
                    style={{ width: 200, height: 112 }}
                  >
                    <Image
                      src={v.thumbnail}
                      alt={v.title}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/vid:opacity-100">
                      <Play
                        size={28}
                        className="text-white"
                        fill="white"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-4">
                      <span className="line-clamp-1 text-[10px] font-medium text-white/80">
                        {v.title}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ─── 9. SIMILAR / RELATED ───────────────────────────────────── */}
          {item.related && item.related.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-cream/30">
                You Might Also Like
              </h3>
              <div
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {item.related.slice(0, 8).map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => setSelectedItem(rel)}
                    className="flex-shrink-0 overflow-hidden rounded-lg transition-transform hover:scale-105"
                    style={{ width: 100, height: 150 }}
                  >
                    {rel.cover_image_url ? (
                      <Image
                        src={rel.cover_image_url}
                        alt={rel.title}
                        width={100}
                        height={150}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-fey-surface text-[10px] text-cream/20">
                        {rel.title}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── 10. REVIEWS SECTION (collapsible) ──────────────────────── */}
          <div className="border-t border-white/[0.04] pt-4">
            <button
              onClick={() => setShowReviews(!showReviews)}
              className="flex w-full items-center justify-between py-1 text-left"
            >
              <span className="text-[13px] font-bold text-cream/60">
                Reviews{" "}
                {reviews.length > 0 && (
                  <span className="text-cream/30">({reviews.length})</span>
                )}
              </span>
              <ChevronDown
                size={16}
                className={`text-cream/40 transition-transform ${showReviews ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showReviews && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  {/* Existing reviews */}
                  {reviews.length > 0 ? (
                    <div className="mb-4 space-y-3">
                      {reviews.map((r: ReviewItem) => (
                        <div
                          key={r.id}
                          className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 text-[9px] font-bold text-gold">
                                {r.user.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-[11px] font-semibold text-cream/60">
                                @{r.user}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star
                                size={10}
                                className="fill-gold text-gold"
                              />
                              <span className="text-[11px] font-bold text-gold">
                                {r.rating}
                              </span>
                            </div>
                          </div>
                          <p className="text-[12px] leading-relaxed text-cream/45">
                            {r.text}
                          </p>
                          <div className="mt-2 text-[10px] text-cream/20">
                            {r.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl border border-white/[0.04] bg-white/[0.015] p-5 text-center">
                      <p className="text-[12px] text-cream/30">
                        No reviews yet. Be the first to share your thoughts.
                      </p>
                    </div>
                  )}

                  {/* Write a Review */}
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                    <h4 className="mb-3 text-[12px] font-bold text-cream/50">
                      Write a Review
                    </h4>
                    <div className="mb-3">
                      <RatingSlider
                        value={reviewRating}
                        onChange={setReviewRating}
                        label="Rating"
                      />
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="What did you think?"
                      rows={3}
                      className="mb-3 w-full resize-none rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px] text-cream placeholder:text-cream/20 outline-none focus:border-gold/20"
                    />
                    <button
                      onClick={handleSubmitReview}
                      disabled={!reviewText.trim() || reviewRating <= 0}
                      className="rounded-lg px-4 py-2 text-[12px] font-bold text-fey-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, #c8a44e, #c8a44eaa)",
                      }}
                    >
                      Submit Review
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
