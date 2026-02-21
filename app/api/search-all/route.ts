/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { searchTMDB } from "@/lib/api/tmdb";
import { searchAnime, searchManga } from "@/lib/api/jikan";
import { searchGames } from "@/lib/api/igdb";
import { searchBooks } from "@/lib/api/books";

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
            genres: (r.genre_ids || []).map(String),
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
              cover_image_url: vi.imageLinks?.thumbnail,
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

    combined.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));

    return NextResponse.json(combined.slice(0, 50));
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
