"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useDeferredValue, useCallback } from "react";

export function useSearch() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", deferredQuery],
    queryFn: async () => {
      if (!deferredQuery.trim()) return [];
      const res = await fetch(
        `/api/search-all?q=${encodeURIComponent(deferredQuery)}`
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: deferredQuery.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    clearSearch,
  };
}
