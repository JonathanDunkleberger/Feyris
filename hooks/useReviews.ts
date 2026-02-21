"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "feyris-reviews";

export interface ReviewItem {
  id: string;
  user: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}

type ReviewMap = Record<string, ReviewItem[]>;

function loadReviews(): ReviewMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveReviews(reviews: ReviewMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // quota exceeded
  }
}

export function useReviews() {
  const [reviews, setReviews] = useState<ReviewMap>(loadReviews);

  useEffect(() => {
    setReviews(loadReviews());
  }, []);

  const getReviews = useCallback(
    (mediaId: string): ReviewItem[] => reviews[mediaId] ?? [],
    [reviews],
  );

  const addReview = useCallback(
    (
      mediaId: string,
      data: { user: string; rating: number; text: string },
    ) => {
      setReviews((prev) => {
        const existing = prev[mediaId] ?? [];
        const newReview: ReviewItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user: data.user,
          rating: data.rating,
          text: data.text,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          helpful: 0,
        };
        const next = { ...prev, [mediaId]: [...existing, newReview] };
        saveReviews(next);
        return next;
      });
    },
    [],
  );

  return { reviews, getReviews, addReview };
}
