/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Goodreads CSV Parser ───────────────────────────────────────────────────
export function parseGoodreadsCSV(csvText: string) {
  const lines = parseCSVLines(csvText);
  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.trim().toLowerCase());
  const titleIdx = headers.indexOf("title");
  const authorIdx = headers.indexOf("author");
  const ratingIdx = headers.indexOf("my rating");
  const shelfIdx = headers.indexOf("exclusive shelf");
  const dateIdx = headers.indexOf("date read");
  const pagesIdx = headers.indexOf("number of pages");

  return lines.slice(1).map((row) => ({
    source_title: row[titleIdx] || "",
    author: row[authorIdx] || "",
    source_rating: ratingIdx >= 0 ? parseFloat(row[ratingIdx]) || 0 : 0,
    source_status: mapGoodreadsShelf(row[shelfIdx] || ""),
    date_completed: row[dateIdx] || undefined,
    pages: pagesIdx >= 0 ? parseInt(row[pagesIdx]) || undefined : undefined,
    media_type: "book" as const,
  }));
}

function mapGoodreadsShelf(shelf: string): string {
  switch (shelf.toLowerCase()) {
    case "read": return "completed";
    case "currently-reading": return "in_progress";
    case "to-read": return "planning";
    default: return "planning";
  }
}

// ─── MyAnimeList CSV/XML Parser ─────────────────────────────────────────────
export function parseMALCSV(csvText: string) {
  const lines = parseCSVLines(csvText);
  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.trim().toLowerCase());
  const titleIdx = headers.findIndex((h) => h.includes("title") || h.includes("series_title"));
  const scoreIdx = headers.findIndex((h) => h.includes("score") || h.includes("my_score"));
  const statusIdx = headers.findIndex((h) => h.includes("status") || h.includes("my_status"));
  const epsIdx = headers.findIndex((h) => h.includes("episodes") || h.includes("my_watched_episodes"));

  return lines.slice(1).map((row) => ({
    source_title: row[titleIdx] || "",
    source_rating: scoreIdx >= 0 ? parseFloat(row[scoreIdx]) || 0 : 0,
    source_status: mapMALStatus(row[statusIdx] || ""),
    episodes_watched: epsIdx >= 0 ? parseInt(row[epsIdx]) || 0 : 0,
    media_type: "anime" as const,
  }));
}

function mapMALStatus(status: string): string {
  const s = status.toLowerCase().replace(/\s+/g, "_");
  switch (s) {
    case "completed": return "completed";
    case "watching": case "reading": return "in_progress";
    case "plan_to_watch": case "plan_to_read": return "planning";
    case "on-hold": case "on_hold": return "on_hold";
    case "dropped": return "dropped";
    default: return "planning";
  }
}

// ─── Letterboxd CSV Parser ──────────────────────────────────────────────────
export function parseLetterboxdCSV(csvText: string) {
  const lines = parseCSVLines(csvText);
  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  const yearIdx = headers.indexOf("year");
  const ratingIdx = headers.indexOf("rating");
  const dateIdx = headers.indexOf("date");

  return lines.slice(1).map((row) => ({
    source_title: row[nameIdx] || "",
    year: yearIdx >= 0 ? parseInt(row[yearIdx]) || undefined : undefined,
    source_rating: ratingIdx >= 0 ? (parseFloat(row[ratingIdx]) || 0) * 2 : 0, // Letterboxd uses 0.5-5, convert to 1-10
    source_status: "completed",
    date_completed: row[dateIdx] || undefined,
    media_type: "film" as const,
  }));
}

// ─── Steam Parser (simplified) ──────────────────────────────────────────────
export function parseSteamCSV(csvText: string) {
  const lines = parseCSVLines(csvText);
  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.trim().toLowerCase());
  const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("game"));
  const hoursIdx = headers.findIndex((h) => h.includes("hours") || h.includes("playtime"));

  return lines.slice(1).map((row) => ({
    source_title: row[nameIdx] || "",
    hours_played: hoursIdx >= 0 ? parseFloat(row[hoursIdx]) || 0 : 0,
    source_status: "completed",
    media_type: "game" as const,
  }));
}

// ─── IMDb CSV Parser ────────────────────────────────────────────────────────
export function parseIMDbCSV(csvText: string) {
  const lines = parseCSVLines(csvText);
  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.trim().toLowerCase());
  const titleIdx = headers.indexOf("title");
  const typeIdx = headers.findIndex((h) => h.includes("title type") || h.includes("type"));
  const ratingIdx = headers.findIndex((h) => h.includes("your rating"));
  const yearIdx = headers.indexOf("year");
  const dateIdx = headers.findIndex((h) => h.includes("date rated"));

  return lines.slice(1).map((row) => {
    const imdbType = (row[typeIdx] || "").toLowerCase();
    const mediaType = imdbType.includes("tv") || imdbType.includes("series")
      ? "tv"
      : "film";

    return {
      source_title: row[titleIdx] || "",
      year: yearIdx >= 0 ? parseInt(row[yearIdx]) || undefined : undefined,
      source_rating: ratingIdx >= 0 ? parseFloat(row[ratingIdx]) || 0 : 0,
      source_status: "completed",
      date_completed: row[dateIdx] || undefined,
      media_type: mediaType as "tv" | "film",
    };
  });
}

// ─── CSV Line Parser ────────────────────────────────────────────────────────
function parseCSVLines(csvText: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    if (inQuotes) {
      if (c === '"' && csvText[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        current.push(field);
        field = "";
      } else if (c === "\n" || (c === "\r" && csvText[i + 1] === "\n")) {
        current.push(field);
        field = "";
        if (current.some((f) => f.trim())) rows.push(current);
        current = [];
        if (c === "\r") i++;
      } else {
        field += c;
      }
    }
  }
  if (field || current.length > 0) {
    current.push(field);
    if (current.some((f) => f.trim())) rows.push(current);
  }
  return rows;
}
