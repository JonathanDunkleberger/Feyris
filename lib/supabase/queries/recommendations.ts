import { createServerClient } from "../server";

export async function getUserRecommendations(
  userId: string,
  limit: number = 20
) {
  // For now, return popular media the user hasn't added to library
  const db = createServerClient();

  // Get user's library media IDs
  const { data: library } = await db
    .from("user_library")
    .select("media_id")
    .eq("user_id", userId);

  const libraryIds = (library || []).map((l) => l.media_id);

  // Get popular media not in user's library
  let q = db
    .from("media")
    .select("*")
    .order("popularity_score", { ascending: false })
    .limit(limit);

  if (libraryIds.length > 0) {
    q = q.not("id", "in", `(${libraryIds.join(",")})`);
  }

  const { data } = await q;
  return data || [];
}
