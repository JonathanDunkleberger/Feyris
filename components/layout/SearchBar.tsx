"use client";

import { useState, useRef, useEffect, useDeferredValue } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";

export function SearchBar() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useAppStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(localQuery);

  useEffect(() => {
    setSearchQuery(deferredQuery);
  }, [deferredQuery, setSearchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  const handleClear = () => {
    setLocalQuery("");
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-200 ${
          focused
            ? "border-gold/20 bg-fey-elevated shadow-[0_0_12px_rgba(200,164,78,0.06)]"
            : "border-gold/[0.06] bg-fey-surface"
        }`}
      >
        <Search
          size={14}
          className={`transition-colors ${
            focused ? "text-gold" : "text-cream/20"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search anime, games, films, books..."
          className="flex-1 bg-transparent text-[12.5px] text-cream placeholder:text-cream/20 outline-none"
        />
        {localQuery && (
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
  );
}
