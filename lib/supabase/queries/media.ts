import { createServerClient } from "../server";

export async function searchMedia(query: string, type?: string) {
  const db = createServerClient();
  let q = db
    .from("media")
    .select("*")
    .ilike("title", `%${query}%`)
    .order("popularity_score", { ascending: false })
    .limit(20);

  if (type) q = q.eq("media_type", type);
  const { data } = await q;
  return data || [];
}

export async function getMediaBySlug(slug: string) {
  const db = createServerClient();
  const { data } = await db
    .from("media")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getMediaById(id: string) {
  const db = createServerClient();
  const { data } = await db.from("media").select("*").eq("id", id).single();
  return data;
}

export async function upsertMedia(media: Record<string, unknown>) {
  const db = createServerClient();
  const { data, error } = await db
    .from("media")
    .upsert(media, { onConflict: "slug" })
    .select()
    .single();
  if (error) console.error("Upsert media error:", error);
  return data;
}

export async function getPopularMedia(type?: string, limit: number = 20) {
  const db = createServerClient();
  let q = db
    .from("media")
    .select("*")
    .order("popularity_score", { ascending: false })
    .limit(limit);

  if (type) q = q.eq("media_type", type);
  const { data } = await q;
  return data || [];
}
