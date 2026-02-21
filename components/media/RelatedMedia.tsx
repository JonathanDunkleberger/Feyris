"use client";

import { Sparkles } from "lucide-react";
import { MediaCarousel } from "./MediaCarousel";
import type { MediaItem } from "@/stores/app-store";

interface RelatedMediaProps {
  items: MediaItem[];
  title?: string;
  onItemClick?: (item: MediaItem) => void;
}

export function RelatedMedia({
  items,
  title = "You Might Also Like",
  onItemClick,
}: RelatedMediaProps) {
  if (!items || items.length === 0) return null;

  return (
    <MediaCarousel
      title={title}
      items={items}
      onItemClick={onItemClick}
      icon={Sparkles}
    />
  );
}
