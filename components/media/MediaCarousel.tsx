"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { MediaCard } from "./MediaCard";
import { MEDIA_TYPES, type MediaType } from "@/lib/constants";
import type { MediaItem } from "@/stores/app-store";
import type { LucideIcon } from "lucide-react";

interface MediaCarouselProps {
  title: string;
  items: MediaItem[];
  onItemClick?: (item: MediaItem) => void;
  icon?: LucideIcon;
  type?: MediaType;
  onViewAll?: () => void;
}

export function MediaCarousel({
  title,
  items,
  onItemClick,
  icon: IconComp,
  type,
  onViewAll,
}: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const tc =
    type && MEDIA_TYPES[type] ? MEDIA_TYPES[type].color : "#c8a44e";

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      checkScroll();
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [checkScroll]);

  const scroll = (dir: number) =>
    scrollRef.current?.scrollBy({ left: dir * 420, behavior: "smooth" });

  if (!items || items.length === 0) return null;

  return (
    <div className="relative mb-[34px]">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 pl-0.5">
        {IconComp && <IconComp size={17} style={{ color: tc }} />}
        <h2 className="text-[17px] font-bold tracking-tight text-cream">
          {title}
        </h2>
        <div
          className="ml-1.5 h-px flex-1"
          style={{
            background: `linear-gradient(90deg, ${tc}20, transparent)`,
          }}
        />
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-[3px] bg-transparent text-[11px] font-medium text-cream/30 transition-colors hover:text-cream/50"
          >
            View all <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Nav buttons */}
        {canLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute -left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-110"
            style={{
              background: "rgba(10,10,15,0.92)",
              border: `1px solid ${tc}30`,
              color: tc,
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute -right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-110"
            style={{
              background: "rgba(10,10,15,0.92)",
              border: `1px solid ${tc}30`,
              color: tc,
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}
          >
            <ChevronRight size={16} />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-1 py-4 -my-2"
          style={{
            scrollbarWidth: "none",
            scrollSnapType: "x mandatory",
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 overflow-visible">
              <MediaCard
                item={item}
                onClick={() => onItemClick?.(item)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
