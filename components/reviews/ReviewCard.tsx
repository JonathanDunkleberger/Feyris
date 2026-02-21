"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Star, AlertTriangle, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Review } from "@/stores/app-store";

interface ReviewCardProps {
  review: Review;
  onVote?: (reviewId: string, vote: "up" | "down") => void;
}

export function ReviewCard({ review, onVote }: ReviewCardProps) {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const hideContent = review.contains_spoilers && !showSpoiler;

  const timeAgo = review.created_at
    ? formatDistanceToNow(new Date(review.created_at), { addSuffix: true })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/[0.03] p-4"
      style={{
        background: "linear-gradient(135deg, rgba(18,18,24,0.85), rgba(12,12,18,0.9))",
      }}
    >
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-[10px] font-bold text-gold">
            {review.user_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="text-[12px] font-semibold text-cream/80">
              {review.user_name || "Anonymous"}
            </div>
            <div className="text-[9px] text-cream/20">{timeAgo}</div>
          </div>
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1 text-gold">
          <Star size={12} fill="#c8a44e" />
          <span className="text-[14px] font-extrabold">{review.overall_rating}</span>
          <span className="text-[10px] text-cream/25">/10</span>
        </div>
      </div>

      {/* Sub-ratings (if any) */}
      {review.sub_ratings && Object.keys(review.sub_ratings).length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {Object.entries(review.sub_ratings).map(([key, val]) => (
            <span
              key={key}
              className="rounded-md px-2 py-0.5 text-[9px] font-medium"
              style={{
                background: "rgba(200,164,78,0.06)",
                color: "rgba(200,164,78,0.6)",
                border: "1px solid rgba(200,164,78,0.08)",
              }}
            >
              {key}: {val}/10
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      {review.title && (
        <h4 className="mb-1.5 text-[13px] font-bold text-cream">
          {review.title}
        </h4>
      )}

      {/* Body */}
      {review.contains_spoilers && !showSpoiler ? (
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg bg-fey-surface px-3 py-3 border border-white/[0.04]">
            <AlertTriangle size={13} className="text-[#d4a574]" />
            <span className="text-[11px] text-cream/35">
              This review contains spoilers.
            </span>
            <button
              onClick={() => setShowSpoiler(true)}
              className="ml-auto text-[10px] font-semibold text-gold hover:text-gold-light transition-colors"
            >
              Show anyway
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[12px] leading-relaxed text-cream/45">
          {review.body}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-3">
        <motion.button
          onClick={() => onVote?.(review.id, "up")}
          className="flex items-center gap-1 text-[10.5px] transition-colors"
          style={{
            color: review.user_vote === "up" ? "#c8a44e" : "rgba(240,235,224,0.25)",
          }}
          whileTap={{ scale: 0.9 }}
        >
          <ThumbsUp size={12} /> {review.upvotes}
        </motion.button>
        <motion.button
          onClick={() => onVote?.(review.id, "down")}
          className="flex items-center gap-1 text-[10.5px] transition-colors"
          style={{
            color: review.user_vote === "down" ? "#d4a574" : "rgba(240,235,224,0.25)",
          }}
          whileTap={{ scale: 0.9 }}
        >
          <ThumbsDown size={12} /> {review.downvotes}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── ReviewList ─────────────────────────────────────────────────────────────
interface ReviewListProps {
  reviews: Review[];
  onVote?: (reviewId: string, vote: "up" | "down") => void;
}

export function ReviewList({ reviews, onVote }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <MessageSquare size={24} className="mb-2 text-cream/10" />
        <p className="text-[12px] text-cream/25">No reviews yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} onVote={onVote} />
      ))}
    </div>
  );
}
