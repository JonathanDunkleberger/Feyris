"use client";

import { create } from "zustand";
import type { ReviewItem } from "@/hooks/useReviews";
import type { MediaItem } from "./app-store";

// ─── Types ──────────────────────────────────────────────────────────────────
interface MediaState {
  // Data
  favorites: string[];
  watched: string[];
  watchlist: string[];
  ratings: Record<string, number>;
  reviews: Record<string, ReviewItem[]>;
  // Items cache — store full MediaItem objects so we can compute taste profile
  items: Record<string, MediaItem>;

  // Actions
  toggleFavorite: (id: string, item?: MediaItem) => void;
  toggleWatched: (id: string, item?: MediaItem) => void;
  toggleWatchlist: (id: string, item?: MediaItem) => void;
  removeFromWatchlist: (id: string) => void;
  setRating: (id: string, value: number) => void;
  addReview: (id: string, review: { user: string; rating: number; text: string }) => void;
  cacheItem: (item: MediaItem) => void;

  // Queries
  isFavorite: (id: string) => boolean;
  isWatched: (id: string) => boolean;
  isOnWatchlist: (id: string) => boolean;
  getRating: (id: string) => number;
  getReviews: (id: string) => ReviewItem[];

  // Hydrate from localStorage
  _hydrated: boolean;
  _hydrate: () => void;
}

// ─── localStorage helpers ───────────────────────────────────────────────────
const KEYS = {
  favorites: "feyris-favorites",
  watched: "feyris-watched",
  watchlist: "feyris-watchlist",
  ratings: "feyris-ratings",
  reviews: "feyris-reviews",
  items: "feyris-items-cache",
} as const;

function loadArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadRecord<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveJSON(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────
export const useMediaStore = create<MediaState>((set, get) => ({
  favorites: [],
  watched: [],
  watchlist: [],
  ratings: {},
  reviews: {},
  items: {},
  _hydrated: false,

  _hydrate: () => {
    if (get()._hydrated) return;
    set({
      favorites: loadArray(KEYS.favorites),
      watched: loadArray(KEYS.watched),
      watchlist: loadArray(KEYS.watchlist),
      ratings: loadRecord<number>(KEYS.ratings),
      reviews: loadRecord<ReviewItem[]>(KEYS.reviews),
      items: loadRecord<MediaItem>(KEYS.items),
      _hydrated: true,
    });
  },

  cacheItem: (item) => {
    const items = { ...get().items, [item.id]: item };
    set({ items });
    saveJSON(KEYS.items, items);
  },

  // ── Favorites ───────────────────────────────────────────────────────────
  toggleFavorite: (id, item) => {
    const prev = get().favorites;
    const next = prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id];
    set({ favorites: next });
    saveJSON(KEYS.favorites, next);
    if (item) {
      const items = { ...get().items, [item.id]: item };
      set({ items });
      saveJSON(KEYS.items, items);
    }
  },

  // ── Watched ─────────────────────────────────────────────────────────────
  toggleWatched: (id, item) => {
    const prev = get().watched;
    const next = prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id];
    set({ watched: next });
    saveJSON(KEYS.watched, next);
    if (item) {
      const items = { ...get().items, [item.id]: item };
      set({ items });
      saveJSON(KEYS.items, items);
    }
  },

  // ── Watchlist ───────────────────────────────────────────────────────────
  toggleWatchlist: (id, item) => {
    const prev = get().watchlist;
    const next = prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id];
    set({ watchlist: next });
    saveJSON(KEYS.watchlist, next);
    if (item) {
      const items = { ...get().items, [item.id]: item };
      set({ items });
      saveJSON(KEYS.items, items);
    }
  },

  removeFromWatchlist: (id) => {
    const next = get().watchlist.filter((x) => x !== id);
    set({ watchlist: next });
    saveJSON(KEYS.watchlist, next);
  },

  // ── Ratings ─────────────────────────────────────────────────────────────
  setRating: (id, value) => {
    const next = { ...get().ratings };
    if (value <= 0) delete next[id];
    else next[id] = value;
    set({ ratings: next });
    saveJSON(KEYS.ratings, next);
  },

  // ── Reviews ─────────────────────────────────────────────────────────────
  addReview: (id, data) => {
    const existing = get().reviews[id] || [];
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
    const next = { ...get().reviews, [id]: [...existing, newReview] };
    set({ reviews: next });
    saveJSON(KEYS.reviews, next);
  },

  // ── Queries (read directly from state) ────────────────────────────────
  isFavorite: (id) => get().favorites.includes(id),
  isWatched: (id) => get().watched.includes(id),
  isOnWatchlist: (id) => get().watchlist.includes(id),
  getRating: (id) => get().ratings[id] ?? 0,
  getReviews: (id) => get().reviews[id] ?? [],
}));
