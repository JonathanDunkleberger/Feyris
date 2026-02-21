"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

export function useLibrary(status?: string) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: ["library", userId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const res = await fetch(`/api/library?${params}`);
      if (!res.ok) throw new Error("Failed to fetch library");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mediaId,
      status = "planning",
    }: {
      mediaId: string;
      status?: string;
    }) => {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, status }),
      });
      if (!res.ok) throw new Error("Failed to add to library");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

export function useUpdateLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      updates,
    }: {
      entryId: string;
      updates: Record<string, unknown>;
    }) => {
      const res = await fetch("/api/library", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, ...updates }),
      });
      if (!res.ok) throw new Error("Failed to update library");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

export function useInProgressMedia() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: ["library", userId, "in_progress"],
    queryFn: async () => {
      const res = await fetch("/api/library?status=in_progress");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!userId,
  });
}
