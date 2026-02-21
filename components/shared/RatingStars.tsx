"use client";

import { Star } from "lucide-react";
import { useState } from "react";

export function RatingStars({
  rating,
  maxRating = 10,
  onRate,
  size = 14,
  interactive = false,
}: {
  rating?: number;
  maxRating?: number;
  onRate?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating || 0;
  const starCount = 5;
  const normalizedRating = (displayRating / maxRating) * starCount;

  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: starCount }).map((_, i) => {
        const filled = normalizedRating >= i + 1;
        const half = !filled && normalizedRating > i;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(((i + 1) / starCount) * maxRating)}
            onMouseEnter={() =>
              interactive &&
              setHoverRating(((i + 1) / starCount) * maxRating)
            }
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${
              interactive
                ? "cursor-pointer hover:scale-110"
                : "cursor-default"
            } transition-transform`}
          >
            <Star
              size={size}
              fill={filled || half ? "#c8a44e" : "transparent"}
              className={
                filled || half ? "text-gold" : "text-white/10"
              }
            />
          </button>
        );
      })}
      {rating != null && (
        <span className="ml-1.5 text-xs font-bold text-gold">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
