"use client";

import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/stores/app-store";

interface MediaGridProps {
  items: MediaItem[];
  onItemClick?: (item: MediaItem) => void;
}

export function MediaGrid({ items, onItemClick }: MediaGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[13px] text-cream/30">No media found</div>
        <div className="mt-1 text-[11px] text-cream/20">
          Try adjusting your search or filters
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-2.5">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  );
}
