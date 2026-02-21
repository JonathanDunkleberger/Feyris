"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAppStore, type MediaItem } from "@/stores/app-store";
import { useSearch } from "@/hooks/useSearch";
import { MEDIA_TYPES } from "@/lib/constants";

export function SearchBar() {
  const { setSearchQuery, setSelectedItem } = useAppStore();
  const { query, setQuery, results, isLoading } = useSearch();
  const [focused, setFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dropdown when results arrive
  useEffect(() => {
    if (results.length > 0 && query.trim()) {
      setShowDropdown(true);
    }
  }, [results, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSearchQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleSelect = (item: MediaItem) => {
    setSelectedItem(item);
    setShowDropdown(false);
    setQuery("");
    setSearchQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-200 ${
            focused
              ? "border-gold/20 bg-fey-elevated shadow-[0_0_12px_rgba(200,164,78,0.06)]"
              : "border-gold/[0.06] bg-fey-surface"
          }`}
        >
          {isLoading ? (
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
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) setShowDropdown(true);
            }}
            onFocus={() => {
              setFocused(true);
              if (query.trim() && results.length > 0) setShowDropdown(true);
            }}
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

      {/* Autocomplete dropdown */}
      {showDropdown && results.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full z-[200] mt-1 max-h-[380px] overflow-y-auto rounded-lg border border-gold/10 py-1 shadow-2xl"
          style={{
            background: "rgba(14,14,20,0.97)",
            backdropFilter: "blur(20px)",
          }}
        >
          {(results as MediaItem[]).slice(0, 8).map((item) => {
            const typeConfig = MEDIA_TYPES[item.media_type];
            return (
              <button
                key={item.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gold/[0.06]"
              >
                {/* Cover thumbnail */}
                <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-[4px] bg-white/[0.04]">
                  {item.cover_image_url && (
                    <Image
                      src={item.cover_image_url}
                      alt={item.title}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  )}
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold text-cream">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-cream/30">
                    <span
                      className="rounded-[3px] px-1 py-[1px] text-[9px] font-bold uppercase"
                      style={{
                        background: typeConfig?.bg || "rgba(200,164,78,0.1)",
                        color: typeConfig?.color || "#c8a44e",
                      }}
                    >
                      {typeConfig?.label || item.media_type}
                    </span>
                    {item.year && <span>{item.year}</span>}
                    {item.author && <span>· {item.author}</span>}
                  </div>
                </div>
                {/* Rating */}
                {item.rating != null && item.rating > 0 && (
                  <span className="shrink-0 text-[10px] font-bold text-gold">
                    {item.rating}%
                  </span>
                )}
              </button>
            );
          })}
          {/* Footer: press enter to search */}
          <div className="border-t border-gold/[0.06] px-3 py-2 text-[10px] text-cream/20">
            Press <kbd className="rounded border border-gold/10 bg-gold/[0.04] px-1 py-0.5 text-[9px] font-bold text-cream/40">Enter</kbd> to see all results
          </div>
        </div>
      )}
    </div>
  );
}
