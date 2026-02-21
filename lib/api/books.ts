const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1";

export async function searchBooks(query: string) {
  const params = new URLSearchParams({
    q: query,
    maxResults: "20",
    printType: "books",
  });
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) params.set("key", key);

  const res = await fetch(`${GOOGLE_BOOKS_BASE}/volumes?${params}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function getBookDetails(volumeId: string) {
  const params = new URLSearchParams();
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) params.set("key", key);

  const res = await fetch(
    `${GOOGLE_BOOKS_BASE}/volumes/${volumeId}?${params}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  return res.json();
}

export function bookCoverUrl(
  volumeInfo: any,
  zoom: number = 1
): string | undefined {
  const links = volumeInfo?.imageLinks;
  if (!links) return undefined;
  // Prefer larger images
  return (
    links.extraLarge ||
    links.large ||
    links.medium ||
    links.small ||
    links.thumbnail ||
    links.smallThumbnail
  )?.replace("http://", "https://");
}

export async function browseBooks(
  subject: string,
  maxResults: number = 20
) {
  const params = new URLSearchParams({
    q: `subject:${subject}`,
    maxResults: String(maxResults),
    orderBy: "relevance",
    printType: "books",
  });
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) params.set("key", key);

  const res = await fetch(`${GOOGLE_BOOKS_BASE}/volumes?${params}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}
