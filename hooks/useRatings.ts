"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "feyris-ratings";

function loadRatings(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRatings(ratings: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch {
    // quota exceeded
  }
}

export function useRatings() {
  const [ratings, setRatings] = useState<Record<string, number>>(loadRatings);

  // Sync on mount (handles SSR)
  useEffect(() => {
    setRatings(loadRatings());
  }, []);

  const getRating = useCallback(
    (id: string): number => ratings[id] ?? 0,
    [ratings],
  );

  const setRating = useCallback((id: string, value: number) => {
    setRatings((prev) => {
      const next = { ...prev };
      if (value <= 0) {
        delete next[id];
      } else {
        next[id] = value;
      }
      saveRatings(next);
      return next;
    });
  }, []);

  return { ratings, getRating, setRating };
}
