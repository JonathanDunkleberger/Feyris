"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useAppStore();
  const [query, setQuery] = useState(searchQuery);
  const [focused, setFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Keep local input in sync when store clears (e.g. ESC in results grid)
  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
      setIsSearching(false);
    }
  }, [searchQuery]);

  const debouncedSetSearch = useCallback(
    (value: string) => {
      clearTimeout(debounceRef.current);
      if (!value.trim()) {
        setSearchQuery("");
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        setSearchQuery(value.trim());
        setIsSearching(false);
      }, 300);
    },
    [setSearchQuery]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    debouncedSetSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      clearTimeout(debounceRef.current);
      setSearchQuery(query.trim());
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSearchQuery("");
    setIsSearching(false);
    clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-200 ${
            focused
              ? "border-gold/20 bg-fey-elevated shadow-[0_0_12px_rgba(200,164,78,0.06)]"
              : "border-gold/[0.06] bg-fey-surface"
          }`}
        >
          {isSearching ? (
            <Loader2
              size={14}
              className="animate-spin text-gold"
            />
          ) : (
            <Search
              size={14}
              className={`transition-colors ${
                focused ? "text-gold" : "text-cream/20"
              }`}
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search anime, games, films, books..."
            className="flex-1 bg-transparent text-[12.5px] text-cream placeholder:text-cream/20 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-cream/25 hover:text-cream/50 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
