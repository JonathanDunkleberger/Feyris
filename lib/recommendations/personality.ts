import { PERSONALITY_TYPES } from "@/lib/constants";

interface WrappedInput {
  library: {
    media: {
      media_type: string;
      genres?: string[];
      title: string;
    };
    status: string;
    rating?: number;
    is_favorite: boolean;
    progress_current: number;
    progress_total?: number;
    started_at?: string;
    completed_at?: string;
  }[];
  activity: {
    action_type: string;
    created_at: string;
    details?: Record<string, unknown>;
  }[];
}

export function calculatePersonality(input: WrappedInput) {
  const { library } = input;

  const completed = library.filter((l) => l.status === "completed");
  const planning = library.filter((l) => l.status === "planning");
  const totalRatings = library.filter((l) => l.rating != null);
  const favorites = library.filter((l) => l.is_favorite);

  // Genre distribution
  const genreCounts: Record<string, number> = {};
  for (const item of library) {
    for (const g of item.media.genres || []) {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    }
  }

  // Type distribution
  const typeCounts: Record<string, number> = {};
  for (const item of library) {
    const t = item.media.media_type;
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }

  const completionRate =
    library.length > 0 ? completed.length / library.length : 0;
  const typeVariety = Object.keys(typeCounts).length;
  const planningRatio =
    library.length > 0 ? planning.length / library.length : 0;
  const hasRPGFantasy =
    (genreCounts["RPG"] || 0) + (genreCounts["Fantasy"] || 0) >
    library.length * 0.3;

  // Score each personality type
  const scores: Record<string, number> = {};

  scores.worldbuilder = hasRPGFantasy ? 3 : 0;
  scores.worldbuilder += (genreCounts["Sci-Fi"] || 0) > 2 ? 2 : 0;

  scores.completionist = completionRate > 0.7 ? 3 : completionRate > 0.5 ? 2 : 0;

  scores.binge_machine = completed.length > 20 ? 3 : completed.length > 10 ? 2 : 0;

  scores.critic = totalRatings.length > library.length * 0.7 ? 3 : 0;
  scores.critic += favorites.length < library.length * 0.1 ? 1 : 0;

  scores.explorer = typeVariety >= 4 ? 3 : typeVariety >= 3 ? 2 : 0;

  scores.loyalist = typeVariety <= 2 ? 3 : 0;
  scores.loyalist += favorites.length > 5 ? 1 : 0;

  scores.curator = planningRatio > 0.4 ? 3 : planningRatio > 0.25 ? 2 : 0;

  // Find the top personality
  const topPersonality = Object.entries(scores).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || "explorer";

  const personality =
    PERSONALITY_TYPES[topPersonality as keyof typeof PERSONALITY_TYPES];

  return {
    type: topPersonality,
    name: personality.name,
    description: personality.description,
  };
}
