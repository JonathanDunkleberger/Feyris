/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { searchTMDB } from "@/lib/api/tmdb";
import { searchAnime, searchManga } from "@/lib/api/jikan";
import { searchGames } from "@/lib/api/igdb";
import { searchBooks, bookCoverUrl } from "@/lib/api/books";

// TMDB Genre ID → Name Map
const TMDB_GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
  10767: "Talk", 10768: "War & Politics",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type");

  if (!q || q.trim().length === 0) {
    return NextResponse.json([]);
  }

  try {
    const promises: Promise<any[]>[] = [];

    if (!type || type === "film" || type === "tv") {
      promises.push(
        searchTMDB(q).then((results) =>
          (results as any[]).map((r: any) => ({
            id: `tmdb-${r.id}`,
            media_type: r.media_type === "tv" ? "tv" : "film",
            title: r.title || r.name || "",
            slug: `tmdb-${r.id}`,
            cover_image_url: r.poster_path
              ? `https://image.tmdb.org/t/p/w300${r.poster_path}`
              : undefined,
            backdrop_image_url: r.backdrop_path
              ? `https://image.tmdb.org/t/p/w780${r.backdrop_path}`
              : undefined,
            description: r.overview,
            year: (r.release_date || r.first_air_date || "").slice(0, 4),
            rating: (r.vote_average || 0) * 10,
            genres: (r.genre_ids || []).map((id: number) => TMDB_GENRE_MAP[id] || String(id)),
            tmdb_id: r.id,
          }))
        )
      );
    }

    if (!type || type === "anime") {
      promises.push(
        searchAnime(q).then((results) =>
          (results as any[]).map((r: any) => ({
            id: `mal-${r.mal_id}`,
            media_type: "anime",
            title: r.title || r.title_english || "",
            slug: `mal-${r.mal_id}`,
            cover_image_url: r.images?.jpg?.large_image_url,
            description: r.synopsis,
            year: String(r.year || ""),
            rating: (r.score || 0) * 10,
            genres: (r.genres || []).map((g: any) => g.name),
            mal_id: r.mal_id,
          }))
        )
      );
    }

    if (!type || type === "manga") {
      promises.push(
        searchManga(q).then((results) =>
          (results as any[]).map((r: any) => ({
            id: `mal-manga-${r.mal_id}`,
            media_type: "manga",
            title: r.title || "",
            slug: `mal-manga-${r.mal_id}`,
            cover_image_url: r.images?.jpg?.large_image_url,
            description: r.synopsis,
            year: String(r.published?.from?.slice(0, 4) || ""),
            rating: (r.score || 0) * 10,
            genres: (r.genres || []).map((g: any) => g.name),
            mal_id: r.mal_id,
          }))
        )
      );
    }

    if (!type || type === "game") {
      promises.push(
        searchGames(q).then((results) =>
          (results as any[]).map((r: any) => ({
            id: `igdb-${r.id}`,
            media_type: "game",
            title: r.name || "",
            slug: `igdb-${r.id}`,
            cover_image_url: r.cover?.url
              ? `https:${r.cover.url.replace("t_thumb", "t_cover_big")}`
              : undefined,
            description: r.summary,
            year: r.first_release_date
              ? new Date(r.first_release_date * 1000).getFullYear().toString()
              : "",
            rating: Math.round(r.total_rating || 0),
            genres: (r.genres || []).map((g: any) => g.name),
            igdb_id: r.id,
          }))
        )
      );
    }

    if (!type || type === "book") {
      promises.push(
        searchBooks(q).then((results) =>
          (results as any[]).map((r: any) => {
            const vi = r.volumeInfo || {};
            return {
              id: `gbook-${r.id}`,
              media_type: "book",
              title: vi.title || "",
              slug: `gbook-${r.id}`,
              cover_image_url: bookCoverUrl(vi),
              description: vi.description,
              year: (vi.publishedDate || "").slice(0, 4),
              rating: (vi.averageRating || 0) * 20,
              genres: vi.categories || [],
              author: (vi.authors || []).join(", "),
              isbn: (vi.industryIdentifiers || [])[0]?.identifier,
            };
          })
        )
      );
    }

    const allResults = await Promise.allSettled(promises);
    const combined = allResults
      .filter(
        (r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled"
      )
      .flatMap((r) => r.value);

    // ── Relevance scoring ──────────────────────────────────────────
    function scoreResult(item: any, query: string): number {
      const qLower = query.toLowerCase().trim();
      const title = (item.title || "").toLowerCase();
      let score = 0;

      // Exact title match = highest priority
      if (title === qLower) {
        score += 1000;
      }
      // Title starts with query
      else if (title.startsWith(qLower)) {
        score += 500;
      }
      // Title is "Query: Subtitle" or "Query - Subtitle"
      else if (title.startsWith(qLower + ":") || title.startsWith(qLower + " -")) {
        score += 400;
      }
      // Query appears as a whole word in title
      else if (new RegExp(`\\b${qLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(title)) {
        score += 300;
      }
      // Query contained as substring in title
      else if (title.includes(qLower)) {
        score += 150;
      }
      // Title doesn't contain query at all — heavy penalty
      else {
        score -= 200;
      }

      // Rating boost (max 50)
      if (item.rating) score += Math.min(item.rating * 0.5, 50);

      // Year boost for recent titles
      const year = parseInt(String(item.year));
      if (year && year > 2000) score += Math.min((year - 2000) * 0.5, 12);

      // Query-to-title ratio: penalize when query is a tiny part of a very long title
      if (title.length > 0) {
        const ratio = qLower.length / title.length;
        score += ratio * 50;
      }

      return score;
    }

    combined.sort((a: any, b: any) => scoreResult(b, q) - scoreResult(a, q));

    // Filter out completely irrelevant results (query not in title at all)
    const qLower = q.toLowerCase().trim();
    const filtered = combined.filter((item: any) => {
      const title = (item.title || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      // Keep if query appears in title or at least in description
      return title.includes(qLower) || desc.includes(qLower);
    });

    // If strict filtering removed everything, fall back to all results
    const results = filtered.length > 0 ? filtered : combined;

    return NextResponse.json(results.slice(0, 50));
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
