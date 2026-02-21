// IGDB requires a Twitch OAuth token
let cachedToken: { token: string; expires: number } | null = null;

async function getTwitchToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID || "",
      client_secret: process.env.TWITCH_CLIENT_SECRET || "",
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) throw new Error("Failed to get Twitch token");
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + data.expires_in * 1000 - 60000,
  };
  return data.access_token;
}

async function igdbFetch(endpoint: string, body: string) {
  const token = await getTwitchToken();
  const res = await fetch(`https://api.igdb.com/v4${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID || "",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  if (!res.ok) return [];
  return res.json();
}

export async function searchGames(query: string) {
  return igdbFetch(
    "/games",
    `search "${query}";
     fields name,cover.url,first_release_date,genres.name,
            platforms.name,rating,summary,videos.*,screenshots.url,
            involved_companies.company.name,involved_companies.developer;
     limit 10;`
  );
}

export async function getGameDetails(igdbId: number) {
  const results = await igdbFetch(
    "/games",
    `where id = ${igdbId};
     fields name,cover.url,first_release_date,genres.name,
            platforms.name,rating,summary,storyline,
            videos.*,screenshots.url,artworks.url,
            involved_companies.company.name,involved_companies.developer,
            involved_companies.publisher,
            game_modes.name,themes.name,
            similar_games.name,similar_games.cover.url;
     limit 1;`
  );
  return results[0] || null;
}

export async function getPopularGames(limit: number = 20) {
  return igdbFetch(
    "/games",
    `fields name,cover.url,first_release_date,genres.name,
            rating,summary,involved_companies.company.name;
     where rating > 75 & rating_count > 50;
     sort rating desc;
     limit ${limit};`
  );
}

export function igdbImageUrl(
  url: string | undefined,
  size: string = "cover_big"
): string | undefined {
  if (!url) return undefined;
  return url.replace("t_thumb", `t_${size}`).replace("//", "https://");
}
