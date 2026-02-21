import { create } from "zustand";
import type { MediaType, LibraryStatus, ImportPlatform, WrappedPeriod } from "@/lib/constants";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface MediaItem {
  id: string;
  media_type: MediaType;
  title: string;
  original_title?: string;
  slug: string;
  description?: string;
  release_date?: string;
  cover_image_url?: string;
  backdrop_image_url?: string;
  genres: string[];
  rating?: number;
  match?: number;
  author?: string; // Studio, developer, author, director
  year?: number;
  metadata?: Record<string, unknown>;
  // External IDs
  tmdb_id?: number;
  igdb_id?: number;
  mal_id?: number;
  isbn?: string;
  // Extended
  videos?: { id: string; title: string; thumbnail: string; type?: string }[];
  cast?: { name: string; character?: string; image_url?: string; role?: string }[];
  // V2 additions
  where_to_watch?: { provider: string; logo_url?: string; url?: string; type: "stream" | "rent" | "buy" }[];
  seasons?: { number: number; episode_count: number; name: string; air_date?: string }[];
  related?: MediaItem[];
  tags?: string[];
  avg_rating?: number;
  review_count?: number;
  status_text?: string; // "Airing", "Completed", "In Production"
  runtime?: number; // minutes for film, episode count for tv/anime
}

export interface LibraryEntry {
  id: string;
  media_id: string;
  media?: MediaItem;
  status: LibraryStatus;
  progress_current: number;
  progress_total?: number;
  progress_percent: number;
  rating?: number;
  sub_ratings?: Record<string, number>; // V2: sub-dimension ratings
  is_favorite: boolean;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
  notes?: string;
  rewatches?: number;
}

export interface ActivityEntry {
  id: string;
  media_id: string;
  media?: MediaItem;
  action_type: string;
  details?: Record<string, unknown>;
  created_at: string;
}

// V2 — Review system
export interface Review {
  id: string;
  user_id: string;
  media_id: string;
  media?: MediaItem;
  overall_rating: number; // 1-10
  sub_ratings?: Record<string, number>; // dimension → 1-10
  title?: string;
  body: string;
  contains_spoilers: boolean;
  upvotes: number;
  downvotes: number;
  user_vote?: "up" | "down" | null;
  created_at: string;
  updated_at: string;
  // user info
  user_name?: string;
  user_avatar?: string;
}

// V2 — Import system
export interface ImportJob {
  id: string;
  platform: ImportPlatform;
  status: "pending" | "processing" | "completed" | "failed";
  total_items: number;
  matched_items: number;
  unmatched_items: number;
  items?: ImportedItem[];
  created_at: string;
  completed_at?: string;
  error?: string;
}

export interface ImportedItem {
  id: string;
  source_title: string;
  source_rating?: number;
  source_status?: string;
  matched_media?: MediaItem;
  match_confidence: number;
  confirmed: boolean;
}

// V2 — Recommendation
export interface Recommendation {
  id: string;
  media: MediaItem;
  score: number;
  reason: string; // "Because you loved X", "Popular in your top genre"
  reason_type: "taste" | "genre" | "cross_medium" | "trending" | "friends";
  source_media?: MediaItem; // The item that triggered this rec
}

// V2 — Wrapped
export interface WrappedData {
  period: WrappedPeriod;
  period_label: string; // "2025", "January 2025", "Week of Jan 6"
  totalHours: number;
  titlesCompleted: number;
  topGenre: string;
  longestStreak: number;
  personality: string;
  personalityDesc: string;
  breakdown: { label: string; hours: number; pct: number; type: string }[];
  topTitles: { title: string; type: string; hours: number; cover_image_url?: string }[];
  // V2 enhanced slides
  fastestBinge?: { title: string; hours: number; days: number };
  genreExplored: number;
  avgRating: number;
  topMonth?: { month: string; hours: number };
  crossMediumFav?: { title: string; type: string };
  shareUrl?: string;
  shareImageUrl?: string;
}

// ─── Store ──────────────────────────────────────────────────────────────────
interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Detail modal
  selectedItem: MediaItem | null;
  setSelectedItem: (item: MediaItem | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Active filter
  activeFilter: string;
  setActiveFilter: (f: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  activeFilter: "All",
  setActiveFilter: (f) => set({ activeFilter: f }),
}));
