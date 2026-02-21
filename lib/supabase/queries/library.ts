import { createServerClient } from "../server";
import type { LibraryStatus } from "@/lib/constants";

export async function getUserLibrary(
  userId: string,
  filters?: {
    status?: LibraryStatus;
    media_type?: string;
    sort?: string;
  }
) {
  const db = createServerClient();
  let q = db
    .from("user_library")
    .select("*, media(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (filters?.status) q = q.eq("status", filters.status);
  const { data } = await q;
  return data || [];
}

export async function addToLibrary(
  userId: string,
  mediaId: string,
  status: LibraryStatus = "planning"
) {
  const db = createServerClient();
  const { data, error } = await db
    .from("user_library")
    .upsert(
      {
        user_id: userId,
        media_id: mediaId,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,media_id" }
    )
    .select()
    .single();
  if (error) console.error("Add to library error:", error);
  return data;
}

export async function updateLibraryEntry(
  entryId: string,
  updates: Partial<{
    status: LibraryStatus;
    progress_current: number;
    progress_total: number;
    rating: number;
    is_favorite: boolean;
  }>
) {
  const db = createServerClient();
  const { data, error } = await db
    .from("user_library")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", entryId)
    .select()
    .single();
  if (error) console.error("Update library error:", error);
  return data;
}

export async function removeFromLibrary(entryId: string) {
  const db = createServerClient();
  const { error } = await db.from("user_library").delete().eq("id", entryId);
  if (error) console.error("Remove from library error:", error);
  return !error;
}

export async function getUserFavorites(userId: string) {
  const db = createServerClient();
  const { data } = await db
    .from("user_library")
    .select("*, media(*)")
    .eq("user_id", userId)
    .eq("is_favorite", true)
    .order("updated_at", { ascending: false });
  return data || [];
}

export async function getInProgressMedia(userId: string) {
  const db = createServerClient();
  const { data } = await db
    .from("user_library")
    .select("*, media(*)")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("updated_at", { ascending: false })
    .limit(4);
  return data || [];
}
