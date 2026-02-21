"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "feyris-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      // localStorage unavailable (SSR, private browsing)
    }
  }, []);

  const toggleFavorite = useCallback((mediaId: string) => {
    setFavorites((prev) => {
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

  const isFavorite = useCallback(
    (mediaId: string) => favorites.includes(mediaId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
