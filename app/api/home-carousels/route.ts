/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getTMDBTrending, discoverTMDB, getTMDBOnAir } from "@/lib/api/tmdb";
import { getTopAnime, getSeasonalAnime, getAnimeByGenre } from "@/lib/api/jikan";
import { getPopularGames, getRecentGames, getTopRatedGames } from "@/lib/api/igdb";
import { browseBooks } from "@/lib/api/books";
import {
  normalizeTMDBMovie,
  normalizeTMDBTV,
  normalizeJikan,
  normalizeIGDB,
  normalizeBook,
} from "@/lib/api/normalize";

export const revalidate = 3600; // Cache for 1 hour

interface CarouselData {
  key: string;
  title: string;
  type: string;
  items: any[];
}

export async function GET() {
  // Determine current anime season
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const season: "winter" | "spring" | "summer" | "fall" =
    month <= 3 ? "winter" : month <= 6 ? "spring" : month <= 9 ? "summer" : "fall";
  const seasonLabel = season.charAt(0).toUpperCase() + season.slice(1);

  // Fire all requests in parallel — each one is independent
  const results = await Promise.allSettled([
    // 0: Trending Movies (TMDB)
    getTMDBTrending("movie", "week"),
    // 1: Trending TV (TMDB)
    getTMDBTrending("tv", "week"),
    // 2: Seasonal Anime (Jikan)
    getSeasonalAnime(year, season, 20),
    // 3: Top Airing Anime (Jikan)
    getTopAnime("airing", 20),
    // 4: Popular Games (IGDB)
    getPopularGames(20),
    // 5: Recently Released Games (IGDB)
    getRecentGames(20),
    // 6: Best-Selling Books - Fiction
    browseBooks("fiction", 20),
    // 7: Sci-Fi & Fantasy Books
    browseBooks("science fiction", 20),
    // 8: Top Rated Films (TMDB discover: high vote, recent)
    discoverTMDB("movie", {
      sort_by: "vote_average.desc",
      "vote_count.gte": "200",
      "primary_release_date.gte": `${year - 2}-01-01`,
    }),
    // 9: Currently On Air TV (TMDB)
    getTMDBOnAir(),
    // 10: Top Rated Games (IGDB)
    getTopRatedGames(20),
    // 11: Action Anime (Jikan - genre 1 = Action)
    getAnimeByGenre(1, 15),
  ]);

  function extract(index: number): any[] {
    const r = results[index];
    return r.status === "fulfilled" ? (r.value || []) : [];
  }

  const carousels: CarouselData[] = [
    {
      key: "trending-movies",
      title: "🔥 Trending Movies",
      type: "film",
      items: extract(0).slice(0, 20).map(normalizeTMDBMovie),
    },
    {
      key: "trending-tv",
      title: "📺 Trending TV Shows",
      type: "tv",
      items: extract(1).slice(0, 20).map(normalizeTMDBTV),
    },
    {
      key: "seasonal-anime",
      title: `🌸 ${seasonLabel} ${year} Anime`,
      type: "anime",
      items: extract(2).slice(0, 20).map((r: any) => normalizeJikan(r)),
    },
    {
      key: "airing-anime",
      title: "⚡ Top Airing Anime",
      type: "anime",
      items: extract(3).slice(0, 20).map((r: any) => normalizeJikan(r)),
    },
    {
      key: "popular-games",
      title: "🎮 Popular Games",
      type: "game",
      items: extract(4).slice(0, 20).map(normalizeIGDB),
    },
    {
      key: "new-games",
      title: "🆕 Recently Released Games",
      type: "game",
      items: extract(5).slice(0, 20).map(normalizeIGDB),
    },
    {
      key: "fiction-books",
      title: "📚 Popular Fiction",
      type: "book",
      items: extract(6).slice(0, 20).map(normalizeBook),
    },
    {
      key: "scifi-books",
      title: "🚀 Sci-Fi & Fantasy Books",
      type: "book",
      items: extract(7).slice(0, 20).map(normalizeBook),
    },
    {
      key: "top-rated-films",
      title: "🏆 Top Rated Films",
      type: "film",
      items: extract(8).slice(0, 20).map(normalizeTMDBMovie),
    },
    {
      key: "on-air-tv",
      title: "📡 Currently On Air",
      type: "tv",
      items: extract(9).slice(0, 20).map(normalizeTMDBTV),
    },
    {
      key: "top-rated-games",
      title: "⭐ Top Rated Games",
      type: "game",
      items: extract(10).slice(0, 20).map(normalizeIGDB),
    },
    {
      key: "action-anime",
      title: "💥 Action Anime",
      type: "anime",
      items: extract(11).slice(0, 15).map((r: any) => normalizeJikan(r)),
    },
  ];

  // Filter out carousels with no items (API failed)
  const valid = carousels.filter((c) => c.items.length > 0);

  return NextResponse.json(valid);
}
