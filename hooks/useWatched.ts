"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "feyris-watched";

export function useWatched() {
  const [watched, setWatched] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWatched(JSON.parse(stored));
    } catch {
      // localStorage unavailable (SSR, private browsing)
    }
  }, []);

  const toggleWatched = useCallback((mediaId: string) => {
    setWatched((prev) => {
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

  const isWatched = useCallback(
    (mediaId: string) => watched.includes(mediaId),
    [watched]
  );

  return { watched, toggleWatched, isWatched };
}
