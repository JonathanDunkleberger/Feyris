"use client";

import Image from "next/image";
import {
  X,
  Star,
  TrendingUp,
  Plus,
  Share2,
  User,
  Film,
} from "lucide-react";
import { MEDIA_TYPES } from "@/lib/constants";
import type { MediaItem } from "@/stores/app-store";
import { useAppStore } from "@/stores/app-store";

export function MediaDetailPanel() {
  const { selectedItem, setSelectedItem } = useAppStore();

  if (!selectedItem) return null;

  const item = selectedItem;
  const config = MEDIA_TYPES[item.media_type as keyof typeof MEDIA_TYPES];
  const tc = config?.color || "#999";
  const TypeIcon = config?.icon || Film;

  const onClose = () => setSelectedItem(null);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center animate-fadeIn"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[92%] max-w-[660px] overflow-auto animate-slideUp"
        style={{
          maxHeight: "88vh",
          background:
            "linear-gradient(160deg, rgba(20,20,28,0.96), rgba(12,12,18,0.98))",
          borderRadius: 18,
          border: "1px solid rgba(200,164,78,0.08)",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
          backdropFilter: "blur(40px)",
          scrollbarWidth: "none",
        }}
      >
        {/* Hero image */}
        <div
          className="relative overflow-hidden"
          style={{ height: 240, borderRadius: "18px 18px 0 0" }}
        >
          {item.cover_image_url ? (
            <Image
              src={item.cover_image_url}
              alt={item.title}
              fill
              className="object-cover"
              sizes="660px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-fey-surface">
              <TypeIcon size={48} style={{ color: tc, opacity: 0.2 }} />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(12,12,18,0.99) 92%)",
              borderRadius: "18px 18px 0 0",
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-cream transition-colors hover:bg-white/10"
            style={{
              background: "rgba(10,10,15,0.55)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <X size={15} />
          </button>

          {/* Title area */}
          <div className="absolute bottom-[18px] left-[22px] right-[22px]">
            <div className="mb-[7px] flex items-center gap-[5px]">
              <div
                className="flex items-center gap-[3px] rounded-[5px] px-2 py-[3px]"
                style={{
                  background: `${tc}15`,
                  border: `1px solid ${tc}22`,
                }}
              >
                <TypeIcon size={11} style={{ color: tc }} />
                <span
                  className="text-[9.5px] font-bold"
                  style={{ color: tc }}
                >
                  {item.media_type}
                </span>
              </div>
              {item.year && (
                <span className="text-[11.5px] text-cream/45">
                  {item.year}
                </span>
              )}
            </div>
            <h2 className="text-[28px] font-extrabold leading-tight tracking-tight text-cream">
              {item.title}
            </h2>
            <div className="mt-[7px] flex items-center gap-2.5">
              {item.rating != null && (
                <span className="flex items-center gap-[3px] text-gold">
                  <Star size={13} fill="#c8a44e" />
                  <span className="text-[14.5px] font-extrabold">
                    {(item.rating / 10).toFixed(1)}
                  </span>
                  <span className="text-[10.5px] text-cream/30">/10</span>
                </span>
              )}
              {item.match != null && (
                <span className="flex items-center gap-[3px] text-[11.5px] font-semibold text-match">
                  <TrendingUp size={12} /> {item.match}% Match
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-[22px] pb-[22px] pt-[14px]">
          {/* Genres */}
          {item.genres && item.genres.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-[5px]">
              {item.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-[5px] px-[9px] py-[3px] text-[10.5px] font-medium"
                  style={{
                    background: `${tc}0c`,
                    color: tc,
                    border: `1px solid ${tc}15`,
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Author / Studio */}
          {item.author && (
            <div className="mb-3 flex items-center gap-1 text-[12.5px] text-cream/45">
              <User size={11} />
              <span className="text-cream">{item.author}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-[12.5px] leading-[1.7] text-cream/55">
            {item.description ||
              "A critically acclaimed masterpiece that has captivated audiences worldwide. Add this title to your library to track your progress and discover related recommendations across all media types."}
          </p>

          {/* Actions */}
          <div className="mt-[18px] flex gap-[7px]">
            <button
              className="flex flex-1 items-center justify-center gap-[5px] rounded-[9px] border-none px-[18px] py-[10px] text-[12.5px] font-bold text-fey-black transition-transform active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, ${tc}, ${tc}aa)`,
              }}
            >
              <Plus size={14} /> Add to Library
            </button>
            <button className="flex items-center gap-[3px] rounded-[9px] border border-white/[0.06] bg-white/[0.025] px-[14px] py-[10px] text-[12.5px] font-semibold text-cream/55 transition-colors hover:bg-white/[0.04]">
              <Star size={13} /> Rate
            </button>
            <button className="flex items-center rounded-[9px] border border-white/[0.06] bg-white/[0.025] px-[14px] py-[10px] text-cream/55 transition-colors hover:bg-white/[0.04]">
              <Share2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
