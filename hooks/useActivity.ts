"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

export function useActivity(limit: number = 20) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: ["activity", userId, limit],
    queryFn: async () => {
      const res = await fetch(`/api/activity?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
    enabled: !!userId,
  });
}
