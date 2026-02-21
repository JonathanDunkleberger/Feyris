import { createServerClient } from "../server";

export async function logActivity(
  userId: string,
  mediaId: string,
  actionType: string,
  libraryEntryId?: string,
  details?: Record<string, unknown>
) {
  const db = createServerClient();
  const { data, error } = await db
    .from("activity_log")
    .insert({
      user_id: userId,
      media_id: mediaId,
      library_entry_id: libraryEntryId || null,
      action_type: actionType,
      details: details || {},
    })
    .select()
    .single();
  if (error) console.error("Log activity error:", error);
  return data;
}

export async function getUserActivity(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  const db = createServerClient();
  const { data } = await db
    .from("activity_log")
    .select("*, media(title, media_type, cover_image_url, slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return data || [];
}
