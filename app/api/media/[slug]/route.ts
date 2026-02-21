/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getTMDBDetails } from "@/lib/api/tmdb";
import { getAnimeDetails } from "@/lib/api/jikan";
import { getGameDetails } from "@/lib/api/igdb";
import { getBookDetails } from "@/lib/api/books";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    // Parse slug format: "tmdb-12345", "mal-67890", "igdb-111", "book-isbn"
    const [source, ...idParts] = slug.split("-");
    const sourceId = idParts.join("-");

    if (!source || !sourceId) {
      return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
    }

    let media: any = null;

    if (source === "tmdb") {
      const id = parseInt(sourceId);
      if (isNaN(id)) return NextResponse.json({ error: "Invalid TMDB ID" }, { status: 400 });
      
      const data: any = await getTMDBDetails(id, "movie");
      if (!data || data.success === false) {
        // Try as TV show
        const tvData: any = await getTMDBDetails(id, "tv");
        if (tvData && tvData.success !== false) {
          media = mapTMDB(tvData, "tv");
        }
      } else {
        media = mapTMDB(data, data.number_of_seasons ? "tv" : "film");
      }
    } else if (source === "mal") {
      const id = parseInt(sourceId);
      if (isNaN(id)) return NextResponse.json({ error: "Invalid MAL ID" }, { status: 400 });
      
      const data: any = await getAnimeDetails(id);
      if (data) {
        media = {
          id: `mal-${data.mal_id}`,
          media_type: "anime",
          title: data.title_english || data.title,
          original_title: data.title_japanese,
          slug: `mal-${data.mal_id}`,
          description: data.synopsis,
          cover_image_url: data.images?.jpg?.large_image_url,
          backdrop_image_url: data.images?.jpg?.large_image_url,
          year: data.year || (data.aired?.from ? new Date(data.aired.from).getFullYear() : undefined),
          rating: (data.score || 0) * 10,
          genres: (data.genres || []).map((g: any) => g.name),
          author: (data.studios || []).map((s: any) => s.name).join(", "),
          mal_id: data.mal_id,
          status_text: data.status,
          runtime: data.episodes,
          cast: (data.characters || []).slice(0, 20).map((c: any) => ({
            name: c.character?.name || "",
            character: c.role,
            image_url: c.character?.images?.jpg?.image_url,
          })),
          videos: data.trailer?.youtube_id
            ? [{
                id: data.trailer.youtube_id,
                title: `${data.title} Trailer`,
                thumbnail: data.trailer.images?.maximum_image_url || `https://i.ytimg.com/vi/${data.trailer.youtube_id}/maxresdefault.jpg`,
                type: "Trailer",
              }]
            : [],
          tags: (data.themes || []).map((t: any) => t.name),
          seasons: data.episodes
            ? [{ number: 1, episode_count: data.episodes, name: "Season 1", air_date: data.aired?.from }]
            : [],
        };
      }
    } else if (source === "igdb") {
      const id = parseInt(sourceId);
      if (isNaN(id)) return NextResponse.json({ error: "Invalid IGDB ID" }, { status: 400 });
      
      const data: any = await getGameDetails(id);
      if (data) {
        media = {
          id: `igdb-${data.id}`,
          media_type: "game",
          title: data.name,
          slug: `igdb-${data.id}`,
          description: data.summary,
          cover_image_url: data.cover?.url
            ? `https:${data.cover.url.replace("t_thumb", "t_cover_big")}`
            : undefined,
          backdrop_image_url: data.screenshots?.[0]?.url
            ? `https:${data.screenshots[0].url.replace("t_thumb", "t_screenshot_big")}`
            : undefined,
          year: data.first_release_date
            ? new Date(data.first_release_date * 1000).getFullYear()
            : undefined,
          rating: data.total_rating ? Math.round(data.total_rating) : undefined,
          genres: (data.genres || []).map((g: any) => g.name),
          author: (data.involved_companies || [])
            .filter((c: any) => c.developer)
            .map((c: any) => c.company?.name)
            .join(", "),
          igdb_id: data.id,
          status_text: data.status ? ["Released", "Alpha", "Beta", "Early Access", "Offline", "Cancelled", "Rumored"][data.status] : undefined,
          videos: (data.videos || []).map((v: any) => ({
            id: v.video_id,
            title: v.name || "Gameplay",
            thumbnail: `https://i.ytimg.com/vi/${v.video_id}/maxresdefault.jpg`,
            type: "Gameplay",
          })),
          where_to_watch: (data.platforms || []).map((p: any) => ({
            provider: p.name || "Platform",
            type: "buy" as const,
          })),
        };
      }
    } else if (source === "book") {
      const data: any = await getBookDetails(sourceId);
      if (data) {
        const vol = data.volumeInfo || {};
        media = {
          id: `book-${sourceId}`,
          media_type: "book",
          title: vol.title || "",
          slug: `book-${sourceId}`,
          description: vol.description,
          cover_image_url: vol.imageLinks?.thumbnail?.replace("http:", "https:"),
          year: vol.publishedDate ? parseInt(vol.publishedDate) : undefined,
          rating: vol.averageRating ? vol.averageRating * 20 : undefined,
          genres: vol.categories || [],
          author: (vol.authors || []).join(", "),
          isbn: sourceId,
          runtime: vol.pageCount,
        };
      }
    }

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error("Media detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media details" },
      { status: 500 }
    );
  }
}

function mapTMDB(data: any, type: "film" | "tv") {
  return {
    id: `tmdb-${data.id}`,
    media_type: type,
    title: data.title || data.name || "",
    original_title: data.original_title || data.original_name,
    slug: `tmdb-${data.id}`,
    description: data.overview,
    cover_image_url: data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : undefined,
    backdrop_image_url: data.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
      : undefined,
    year: (data.release_date || data.first_air_date || "").slice(0, 4),
    rating: data.vote_average ? Math.round(data.vote_average * 10) : undefined,
    genres: (data.genres || []).map((g: any) => g.name),
    author: type === "film"
      ? (data.credits?.crew || []).find((c: any) => c.job === "Director")?.name
      : (data.created_by || []).map((c: any) => c.name).join(", "),
    tmdb_id: data.id,
    status_text: data.status,
    runtime: type === "film" ? data.runtime : data.number_of_episodes,
    cast: (data.credits?.cast || []).slice(0, 20).map((c: any) => ({
      name: c.name,
      character: c.character,
      image_url: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : undefined,
    })),
    videos: (data.videos?.results || [])
      .filter((v: any) => v.site === "YouTube")
      .slice(0, 8)
      .map((v: any) => ({
        id: v.key,
        title: v.name,
        thumbnail: `https://i.ytimg.com/vi/${v.key}/maxresdefault.jpg`,
        type: v.type,
      })),
    seasons: type === "tv"
      ? (data.seasons || []).map((s: any) => ({
          number: s.season_number,
          episode_count: s.episode_count,
          name: s.name,
          air_date: s.air_date,
        }))
      : undefined,
    where_to_watch: (data["watch/providers"]?.results?.US?.flatrate || []).map((p: any) => ({
      provider: p.provider_name,
      logo_url: p.logo_path
        ? `https://image.tmdb.org/t/p/w45${p.logo_path}`
        : undefined,
      type: "stream" as const,
    })),
    tags: (data.keywords?.keywords || data.keywords?.results || []).map((k: any) => k.name),
  };
}
