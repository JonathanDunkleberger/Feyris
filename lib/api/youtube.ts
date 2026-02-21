export async function searchYouTube(query: string, maxResults: number = 5) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    maxResults: String(maxResults),
    type: "video",
    key,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
    { next: { revalidate: 604800 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url || "",
    channelTitle: item.snippet.channelTitle,
  }));
}
