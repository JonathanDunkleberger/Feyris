"use client";

import { useQuery } from "@tanstack/react-query";

export function useMediaDetail(slug: string | null) {
  return useQuery({
    queryKey: ["media", slug],
    queryFn: async () => {
      const res = await fetch(`/api/media/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch media");
      return res.json();
    },
    enabled: !!slug,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
