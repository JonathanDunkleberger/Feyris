"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "feyris-watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWatchlist(JSON.parse(stored));
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleWatchlist = useCallback((mediaId: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(mediaId)
        ? prev.filter((id) => id !== mediaId)
        : [...prev, mediaId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((mediaId: string) => {
    setWatchlist((prev) => {
      const next = prev.filter((id) => id !== mediaId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  const isOnWatchlist = useCallback(
    (mediaId: string) => watchlist.includes(mediaId),
    [watchlist],
  );

  return { watchlist, toggleWatchlist, removeFromWatchlist, isOnWatchlist };
}
