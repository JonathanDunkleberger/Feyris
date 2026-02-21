"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Star,
  TrendingUp,
  Heart,
  CheckCircle,
  Clock,
  User,
  Film,
  ChevronDown,
  ExternalLink,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { MEDIA_TYPES } from "@/lib/constants";
import type { MediaItem } from "@/stores/app-store";
import { useAppStore } from "@/stores/app-store";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatched } from "@/hooks/useWatched";
import { useWatchlist } from "@/hooks/useWatchlist";
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

function getWatchlistLabel(type: string) {
  switch (type) {
    case "anime":
    case "tv":
    case "film":
      return "Want to Watch";
    case "game":
      return "Want to Play";
    case "book":
      return "Want to Read";
    default:
      return "Add to Watchlist";
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
  const { user, isSignedIn } = useUser();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isWatched, toggleWatched } = useWatched();
  const { isOnWatchlist, toggleWatchlist, removeFromWatchlist } =
    useWatchlist();
  const { getRating, setRating } = useRatings();
  const { getReviews, addReview } = useReviews();
  const [showReviews, setShowReviews] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [ratingMode, setRatingMode] = useState(false);
  const [writingReview, setWritingReview] = useState(false);
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
    setWritingReview(false);
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
  const onWatchlist = isOnWatchlist(item.id);
  const userRating = getRating(item.id);
  const reviews = getReviews(item.id);
  const ratingSource = getRatingSource(item.media_type);

  const onClose = () => setSelectedItem(null);

  const descriptionLong = (item.description?.length || 0) > 250;
  const displayDescription = showFullDescription
    ? item.description
    : item.description?.slice(0, 250);

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

  // ── Action handlers with cross-list logic ──
  const handleFavorite = () => {
    toggleFavorite(item.id);
    // Favoriting = you've consumed it → auto-mark watched, remove from watchlist
    if (!favorited) {
      if (!watched) toggleWatched(item.id);
      if (onWatchlist) removeFromWatchlist(item.id);
    }
  };

  const handleWatched = () => {
    toggleWatched(item.id);
    // Marking watched → remove from watchlist (you've consumed it)
    if (!watched && onWatchlist) {
      removeFromWatchlist(item.id);
    }
  };

  const handleWatchlist = () => {
    toggleWatchlist(item.id);
  };

  const handleSubmitReview = () => {
    if (reviewRating <= 0) return;
    const username =
      isSignedIn && user
        ? user.username || user.firstName || "User"
        : "Anonymous";
    addReview(item.id, {
      user: username,
      rating: reviewRating,
      text: reviewText.trim(),
    });
    setReviewText("");
    setReviewRating(0);
    setWritingReview(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/[0.05]"
        style={{
          maxHeight: "95vh",
          background: "#0a0a0f",
          boxShadow: "0 0 80px rgba(0,0,0,0.8)",
          scrollbarWidth: "none",
        }}
      >
        {/* ─── 1. HERO ─────────────────────────────────────────────────── */}
        <div
          className="relative w-full overflow-hidden rounded-t-2xl"
          style={{ height: 340 }}
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
                "linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.4) 40%, #0a0a0f 100%)",
            }}
          />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/70"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            <X size={16} className="text-white/80" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
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
                <span className="text-xs text-[#f0ebe0]/40">{item.year}</span>
              )}
            </div>
            <h1 className="text-3xl font-black leading-tight text-[#f0ebe0] mb-2">
              {item.title}
            </h1>
            {item.original_title && item.original_title !== item.title && (
              <div className="mb-2 text-[12px] italic text-[#f0ebe0]/30">
                {item.original_title}
              </div>
            )}

            {/* Dual ratings */}
            <div className="flex items-center gap-4 text-sm">
              {item.rating != null && item.rating > 0 && (
                <span className="flex items-center gap-1 text-[#f0ebe0]/50">
                  <span className="text-[10px] font-semibold uppercase text-[#f0ebe0]/35">
                    {ratingSource}
                  </span>
                  <Star
                    size={12}
                    className="fill-yellow-500 text-yellow-500"
                  />
                  <span className="text-[14px] font-extrabold text-[#f0ebe0]/60">
                    {(item.rating / 10).toFixed(1)}
                  </span>
                </span>
              )}
              {userRating > 0 && (
                <span className="flex items-center gap-1 text-[#c8a44e]">
                  <span className="text-[10px] font-semibold uppercase text-[#c8a44e]/60">
                    Feyris
                  </span>
                  <Star size={12} className="fill-[#c8a44e] text-[#c8a44e]" />
                  <span className="text-[14px] font-extrabold">
                    {userRating}
                  </span>
                </span>
              )}
              {item.match != null && item.match > 0 && (
                <span className="flex items-center gap-1 text-[12px] font-semibold text-green-400">
                  <TrendingUp size={13} /> {item.match}% Match
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── BODY ────────────────────────────────────────────────────── */}
        <div className="px-6 pb-6 pt-4">
          {/* 2. METADATA */}
          {metaLine.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#f0ebe0]/45">
              <User size={12} className="text-[#f0ebe0]/25" />
              {metaLine.map((part, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-[#f0ebe0]/15">&middot;</span>}
                  <span className="text-[#f0ebe0]/60">{part}</span>
                </span>
              ))}
            </div>
          )}

          {/* 3. GENRES */}
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

          {/* 4. DESCRIPTION */}
          {item.description && (
            <div className="mb-4">
              <p className="text-[13px] leading-[1.75] text-[#f0ebe0]/55">
                {displayDescription}
                {descriptionLong && !showFullDescription && "..."}
              </p>
              {descriptionLong && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-1 text-[11px] font-semibold text-[#c8a44e]/60 hover:text-[#c8a44e] transition-colors"
                >
                  {showFullDescription ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}

          {/* 5. THREE ACTION BUTTONS */}
          <div className="mb-5 flex flex-wrap gap-3">
            {/* Favorite */}
            <button
              onClick={handleFavorite}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all ${
                favorited
                  ? "border border-red-500/30 bg-red-500/[0.12] text-red-400"
                  : "border border-white/[0.06] bg-white/[0.04] text-[#f0ebe0]/60 hover:bg-white/[0.07]"
              }`}
            >
              <Heart
                size={16}
                className={favorited ? "fill-red-400 text-red-400" : ""}
              />
              {favorited ? "Favorited" : "Favorite"}
            </button>

            {/* Watched */}
            <button
              onClick={handleWatched}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all ${
                watched
                  ? "border border-green-500/30 bg-green-500/[0.12] text-green-400"
                  : "border border-white/[0.06] bg-white/[0.04] text-[#f0ebe0]/60 hover:bg-white/[0.07]"
              }`}
            >
              <CheckCircle
                size={16}
                className={watched ? "fill-green-400 text-green-400" : ""}
              />
              {watched
                ? getWatchedLabel(item.media_type)
                : getWatchLabel(item.media_type)}
            </button>

            {/* Watchlist */}
            <button
              onClick={handleWatchlist}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all ${
                onWatchlist
                  ? "border border-[#c8a44e]/30 bg-[#c8a44e]/[0.12] text-[#c8a44e]"
                  : "border border-white/[0.06] bg-white/[0.04] text-[#f0ebe0]/60 hover:bg-white/[0.07]"
              }`}
            >
              <Clock
                size={16}
                className={onWatchlist ? "fill-[#c8a44e] text-[#c8a44e]" : ""}
              />
              {onWatchlist
                ? "On Watchlist"
                : getWatchlistLabel(item.media_type)}
            </button>
          </div>

          {/* 6. YOUR RATING */}
          <div className="mb-5">
            <button
              onClick={() => setRatingMode(!ratingMode)}
              className="flex items-center gap-1.5 text-[12px] font-bold text-[#f0ebe0]/40 hover:text-[#f0ebe0]/60 transition-colors"
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
                  className="mt-2 overflow-hidden rounded-xl border border-[#c8a44e]/10 bg-[#c8a44e]/[0.03] p-4"
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

          {/* 7. WHERE TO WATCH */}
          {item.where_to_watch && item.where_to_watch.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#f0ebe0]/30">
                Where to Watch
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.where_to_watch.map((w, i) => (
                  <a
                    key={i}
                    href={w.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-[#f0ebe0]/60 transition-colors hover:bg-white/[0.06]"
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
                    <ExternalLink size={10} className="text-[#f0ebe0]/25" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 8. VIDEOS */}
          {item.videos && item.videos.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#f0ebe0]/30">
                Videos
              </h3>
              <div
                className="scrollbar-hide"
                style={{
                  display: "flex",
                  gap: "12px",
                  overflowX: "auto",
                  overflowY: "visible",
                  scrollBehavior: "smooth",
                  paddingBottom: "8px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                } as React.CSSProperties}
              >
                {item.videos.slice(0, 6).map((v) => (
                  <a
                    key={v.id}
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/vid relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg"
                    style={{ width: 240, height: 135 }}
                  >
                    <Image
                      src={v.thumbnail}
                      alt={v.title}
                      fill
                      className="object-cover"
                      sizes="240px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover/vid:bg-black/50">
                      <Play size={32} className="text-white fill-white" />
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

          {/* 9. YOU MIGHT ALSO LIKE */}
          {item.related && item.related.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#f0ebe0]/30">
                You Might Also Like
              </h3>
              <div
                className="scrollbar-hide"
                style={{
                  display: "flex",
                  gap: "12px",
                  overflowX: "auto",
                  overflowY: "visible",
                  scrollSnapType: "x mandatory",
                  scrollBehavior: "smooth",
                  paddingTop: "4px",
                  paddingBottom: "12px",
                  paddingLeft: "2px",
                  paddingRight: "2px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                } as React.CSSProperties}
              >
                {item.related.slice(0, 15).map((rel) => (
                  <div
                    key={rel.id}
                    style={{
                      flexShrink: 0,
                      scrollSnapAlign: "start",
                      width: "120px",
                      overflow: "visible",
                    }}
                  >
                    <button
                      onClick={() => setSelectedItem(rel)}
                      className="group/rel relative w-full cursor-pointer"
                      style={{ overflow: "visible" }}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 ease-out group-hover/rel:scale-105 group-hover/rel:-translate-y-1 group-hover/rel:shadow-lg">
                        {rel.cover_image_url ? (
                          <Image
                            src={rel.cover_image_url}
                            alt={rel.title}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-fey-surface text-[10px] text-[#f0ebe0]/20">
                            {rel.title}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-white">
                            {rel.title}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. REVIEWS */}
          <div className="border-t border-white/[0.04] mt-6 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#f0ebe0]/80">
                Community Reviews
                {reviews.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-[#f0ebe0]/30">
                    ({reviews.length})
                  </span>
                )}
              </h3>
              <button
                onClick={() => setWritingReview(!writingReview)}
                className="text-xs font-semibold text-[#c8a44e] hover:text-[#c8a44e]/80 transition-colors"
              >
                Write a Review
              </button>
            </div>

            {/* Write review form */}
            <AnimatePresence>
              {writingReview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                    <div className="mb-3">
                      <RatingSlider
                        value={reviewRating}
                        onChange={setReviewRating}
                        label="Your rating"
                      />
                    </div>
                    <textarea
                      placeholder="Share your thoughts... (optional)"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      className="mb-3 w-full resize-none rounded-lg border border-white/[0.06] bg-transparent px-3 py-2.5 text-sm text-[#f0ebe0] placeholder:text-[#f0ebe0]/20 focus:border-[#c8a44e]/30 focus:outline-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#f0ebe0]/20">
                        {isSignedIn
                          ? `Posting as ${user?.username || user?.firstName || "User"}`
                          : "Posting as Anonymous"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setWritingReview(false)}
                          className="px-3 py-1.5 text-xs text-[#f0ebe0]/40 hover:text-[#f0ebe0]/60"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitReview}
                          disabled={reviewRating <= 0}
                          className="rounded-lg px-4 py-1.5 text-xs font-bold text-[#0a0a0f] transition-all hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{
                            background: "#c8a44e",
                          }}
                        >
                          Post Review
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Review list */}
            {reviews.length === 0 ? (
              <p className="text-sm text-[#f0ebe0]/20 text-center py-6">
                No reviews yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4">
                {[...reviews]
                  .sort((a, b) => (b.helpful || 0) - (a.helpful || 0))
                  .map((r: ReviewItem) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-white/[0.03] bg-white/[0.015] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c8a44e]/20">
                            <User size={12} className="text-[#c8a44e]" />
                          </div>
                          <span className="text-xs font-semibold text-[#f0ebe0]/70">
                            {r.user || "Anonymous"}
                          </span>
                          <span className="text-xs text-[#f0ebe0]/20">
                            {r.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star
                            size={11}
                            className="fill-[#c8a44e] text-[#c8a44e]"
                          />
                          <span className="text-xs font-bold text-[#c8a44e]">
                            {r.rating}
                          </span>
                        </div>
                      </div>
                      {r.text && (
                        <p className="text-sm leading-relaxed text-[#f0ebe0]/50">
                          {r.text}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
