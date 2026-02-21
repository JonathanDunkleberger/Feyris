// ─── Tag-Based Affinity Scoring ─────────────────────────────────────────────

export interface TasteProfile {
  genres: Record<string, number>;
  tags: Record<string, number>;
  type_preference: Record<string, number>;
  avg_rating: number;
  favorite_ids: string[];
}

interface LibraryItem {
  media: {
    id: string;
    media_type: string;
    genres?: string[];
    tags?: { name: string; relevance: number }[];
  };
  status: string;
  rating?: number;
  is_favorite: boolean;
  updated_at: string;
}

export function buildTasteProfile(library: LibraryItem[]): TasteProfile {
  const genres: Record<string, number> = {};
  const tags: Record<string, number> = {};
  const typeCount: Record<string, number> = {};
  let totalRating = 0;
  let ratingCount = 0;
  const favoriteIds: string[] = [];

  const sixMonthsAgo = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;

  for (const item of library) {
    if (!item.media) continue;

    // Calculate weight
    let weight = 1.0;

    // Rating weight
    if (item.rating) {
      if (item.rating >= 9) weight *= 3;
      else if (item.rating >= 8) weight *= 2;
      totalRating += item.rating;
      ratingCount++;
    }

    // Status weight
    if (item.status === "completed") weight *= 1.0;
    else if (item.status === "in_progress") weight *= 0.7;
    else if (item.status === "dropped") weight *= 0.1;
    else if (item.status === "planning") weight *= 0.3;

    // Recency weight
    if (new Date(item.updated_at).getTime() > sixMonthsAgo) {
      weight *= 1.5;
    }

    // Favorite weight
    if (item.is_favorite) {
      weight *= 3;
      favoriteIds.push(item.media.id);
    }

    // Accumulate genre scores
    for (const genre of item.media.genres || []) {
      genres[genre] = (genres[genre] || 0) + weight;
    }

    // Accumulate tag scores
    for (const tag of item.media.tags || []) {
      tags[tag.name] = (tags[tag.name] || 0) + weight * tag.relevance;
    }

    // Type preference
    const mt = item.media.media_type;
    typeCount[mt] = (typeCount[mt] || 0) + weight;
  }

  // Normalize genre scores to 0-1
  const maxGenre = Math.max(...Object.values(genres), 1);
  for (const k of Object.keys(genres)) genres[k] /= maxGenre;

  const maxTag = Math.max(...Object.values(tags), 1);
  for (const k of Object.keys(tags)) tags[k] /= maxTag;

  const totalType = Object.values(typeCount).reduce((a, b) => a + b, 0) || 1;
  const type_preference: Record<string, number> = {};
  for (const [k, v] of Object.entries(typeCount)) {
    type_preference[k] = v / totalType;
  }

  return {
    genres,
    tags,
    type_preference,
    avg_rating: ratingCount > 0 ? totalRating / ratingCount : 0,
    favorite_ids: favoriteIds,
  };
}

export function scoreMedia(
  profile: TasteProfile,
  media: {
    media_type: string;
    genres?: string[];
    tags?: { name: string; relevance: number }[];
    popularity_score?: number;
  }
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Genre matching
  let genreScore = 0;
  for (const genre of media.genres || []) {
    if (profile.genres[genre]) {
      genreScore += profile.genres[genre];
      if (profile.genres[genre] > 0.7) {
        reasons.push(`Matches your love of ${genre}`);
      }
    }
  }
  score += genreScore;

  // Tag matching
  let tagScore = 0;
  for (const tag of media.tags || []) {
    if (profile.tags[tag.name]) {
      tagScore += profile.tags[tag.name] * tag.relevance;
    }
  }
  score += tagScore;

  // Popularity bonus (small)
  if (media.popularity_score) {
    score += Math.min(media.popularity_score / 1000, 0.5);
  }

  // Cross-medium bonus
  const userTopType = Object.entries(profile.type_preference).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];
  if (userTopType && media.media_type !== userTopType && genreScore > 0.5) {
    score *= 1.3;
    reasons.push(`Discover this ${media.media_type} based on your taste`);
  }

  return {
    score: Math.round(Math.min(score * 20, 99)),
    reasons: reasons.slice(0, 3),
  };
}
