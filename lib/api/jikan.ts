const JIKAN_BASE = "https://api.jikan.moe/v4";

export async function searchAnime(query: string) {
  const res = await fetch(
    `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&order_by=members&sort=desc&limit=20`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function searchManga(query: string) {
  const res = await fetch(
    `${JIKAN_BASE}/manga?q=${encodeURIComponent(query)}&order_by=members&sort=desc&limit=15`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function getAnimeDetails(malId: number) {
  const [anime, chars, videos] = await Promise.all([
    fetch(`${JIKAN_BASE}/anime/${malId}/full`, {
      next: { revalidate: 86400 },
    }).then((r) => (r.ok ? r.json() : null)),
    fetch(`${JIKAN_BASE}/anime/${malId}/characters`, {
      next: { revalidate: 86400 },
    }).then((r) => (r.ok ? r.json() : null)),
    fetch(`${JIKAN_BASE}/anime/${malId}/videos`, {
      next: { revalidate: 604800 },
    }).then((r) => (r.ok ? r.json() : null)),
  ]);

  return {
    ...(anime?.data || {}),
    characters: chars?.data || [],
    videos: videos?.data || {},
  };
}

export async function getTopAnime(
  filter: "airing" | "upcoming" | "bypopularity" | "favorite" = "bypopularity",
  limit: number = 20
) {
  const res = await fetch(
    `${JIKAN_BASE}/top/anime?filter=${filter}&limit=${limit}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function getSeasonalAnime(
  year: number = new Date().getFullYear(),
  season: "winter" | "spring" | "summer" | "fall" = "winter",
  limit: number = 20
) {
  const res = await fetch(
    `${JIKAN_BASE}/seasons/${year}/${season}?order_by=score&sort=desc&limit=${limit}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function getAnimeByGenre(genreId: number, limit: number = 10) {
  const res = await fetch(
    `${JIKAN_BASE}/anime?genres=${genreId}&order_by=score&sort=desc&limit=${limit}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}
