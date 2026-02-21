"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  TrendingUp,
  Clock,
  Calendar,
  Film,
  Share2,
  ExternalLink,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MEDIA_TYPES } from "@/lib/constants";
import type { MediaItem } from "@/stores/app-store";
import { TypeBadge } from "@/components/shared/TypeBadge";
import { GenreChip } from "@/components/shared/GenreChip";
import { SkeletonDetail } from "@/components/shared/Skeleton";
import { VideoCarousel } from "@/components/media/VideoCarousel";
import { CastCarousel } from "@/components/media/CastCarousel";
import { WhereToWatch } from "@/components/media/WhereToWatch";
import { ProgressUpdater } from "@/components/media/ProgressUpdater";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import type { MediaType } from "@/lib/constants";

export default function MediaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const { data: media, isLoading, error } = useQuery<MediaItem>({
    queryKey: ["media-detail", slug],
    queryFn: async () => {
      const res = await fetch(`/api/media/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!slug,
    staleTime: 24 * 60 * 60 * 1000,
  });

  if (isLoading) return <SkeletonDetail />;

  if (error || !media) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Film size={36} className="mb-3 text-cream/10" />
        <h3 className="mb-1 text-[15px] font-bold text-cream/50">
          Media not found
        </h3>
        <p className="text-[12px] text-cream/25">
          We couldn&apos;t find the media you&apos;re looking for.
        </p>
        <Link
          href="/discover"
          className="mt-4 rounded-lg border border-gold/15 bg-gold/[0.06] px-5 py-2 text-[12px] font-semibold text-gold"
        >
          Back to Discover
        </Link>
      </div>
    );
  }

  const config = MEDIA_TYPES[media.media_type as MediaType];
  const tc = config?.color || "#999";
  const TypeIcon = config?.icon || Film;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero Section */}
      <div className="relative -mx-6 -mt-[70px] mb-6 overflow-hidden" style={{ height: 420 }}>
        {/* Backdrop image */}
        {(media.backdrop_image_url || media.cover_image_url) && (
          <Image
            src={media.backdrop_image_url || media.cover_image_url || ""}
            alt={media.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-fey-black via-fey-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-fey-black/70 to-transparent" />

        {/* Back button */}
        <div className="absolute left-6 top-20">
          <Link href="/discover">
            <motion.button
              className="flex items-center gap-1.5 rounded-lg bg-fey-black/50 px-3 py-2 text-[12px] font-medium text-cream/70 backdrop-blur-sm border border-white/[0.06] hover:text-cream"
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={14} /> Back
            </motion.button>
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="flex gap-5">
            {/* Poster */}
            {media.cover_image_url && (
              <motion.div
                className="relative hidden h-[200px] w-[140px] flex-shrink-0 overflow-hidden rounded-xl shadow-2xl md:block"
                style={{ border: `2px solid ${tc}20` }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <Image
                  src={media.cover_image_url}
                  alt={media.title}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </motion.div>
            )}

            {/* Title & meta */}
            <motion.div
              className="flex flex-col justify-end"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="mb-2 flex items-center gap-2">
                <TypeBadge type={media.media_type as MediaType} size="sm" />
                {media.year && (
                  <span className="flex items-center gap-1 text-[11px] text-cream/40">
                    <Calendar size={10} /> {media.year}
                  </span>
                )}
                {media.status_text && (
                  <span
                    className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: `${tc}15`, color: tc }}
                  >
                    {media.status_text}
                  </span>
                )}
              </div>

              <h1 className="mb-1.5 text-[32px] font-black leading-tight tracking-tight text-cream">
                {media.title}
              </h1>

              {media.original_title && media.original_title !== media.title && (
                <p className="mb-2 text-[12px] text-cream/30 italic">
                  {media.original_title}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {media.rating != null && media.rating > 0 && (
                  <span className="flex items-center gap-1 text-gold">
                    <Star size={15} fill="#c8a44e" />
                    <span className="text-[18px] font-extrabold">
                      {(media.rating / 10).toFixed(1)}
                    </span>
                    <span className="text-[11px] text-cream/30">/10</span>
                  </span>
                )}
                {media.match != null && (
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-match">
                    <TrendingUp size={13} /> {media.match}% Match
                  </span>
                )}
                {media.author && (
                  <span className="text-[12px] text-cream/40">
                    {media.author}
                  </span>
                )}
                {media.runtime != null && (
                  <span className="flex items-center gap-1 text-[11px] text-cream/30">
                    <Clock size={10} />
                    {media.media_type === "film"
                      ? `${media.runtime} min`
                      : media.media_type === "book"
                      ? `${media.runtime} pages`
                      : `${media.runtime} episodes`}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left column — main content */}
        <div>
          {/* Genres */}
          {media.genres && media.genres.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
              {media.genres.map((g) => (
                <GenreChip key={g} genre={g} color={tc} />
              ))}
            </div>
          )}

          {/* Description */}
          {media.description && (
            <div className="mb-6">
              <h3 className="mb-2 text-[14px] font-bold text-cream">Overview</h3>
              <p className="text-[13px] leading-relaxed text-cream/50">
                {media.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {media.tags && media.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-1.5">
                {media.tags.slice(0, 12).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-1 text-[9.5px] font-medium text-cream/30 border border-white/[0.04] bg-fey-surface"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {media.videos && media.videos.length > 0 && (
            <VideoCarousel videos={media.videos} />
          )}

          {/* Cast */}
          {media.cast && media.cast.length > 0 && (
            <CastCarousel cast={media.cast} />
          )}

          {/* Seasons (for TV/Anime) */}
          {media.seasons && media.seasons.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-[14px] font-bold text-cream">Seasons</h3>
              <div className="space-y-2">
                {media.seasons.map((season) => (
                  <div
                    key={season.number}
                    className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-fey-surface px-4 py-3"
                  >
                    <div>
                      <span className="text-[12.5px] font-semibold text-cream">
                        {season.name}
                      </span>
                      <span className="ml-2 text-[10.5px] text-cream/30">
                        {season.episode_count} episodes
                      </span>
                    </div>
                    {season.air_date && (
                      <span className="text-[10px] text-cream/25">
                        {new Date(season.air_date).getFullYear()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related / Similar */}
          {media.related && media.related.length > 0 && (
            <MediaCarousel
              title="You Might Also Like"
              items={media.related}
              icon={Star}
            />
          )}
        </div>

        {/* Right column — sidebar */}
        <div className="space-y-4">
          {/* Progress / Library tracker */}
          <ProgressUpdater />

          {/* Where to Watch */}
          {media.where_to_watch && media.where_to_watch.length > 0 && (
            <WhereToWatch providers={media.where_to_watch} />
          )}

          {/* Quick info card */}
          <div
            className="rounded-xl border border-white/[0.04] p-4 space-y-2.5"
            style={{
              background:
                "linear-gradient(135deg, rgba(18,18,24,0.9), rgba(12,12,18,0.95))",
            }}
          >
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-cream/25 mb-3">
              Details
            </h4>
            {media.media_type && (
              <InfoRow label="Type" value={config?.label || media.media_type} />
            )}
            {media.year && <InfoRow label="Year" value={String(media.year)} />}
            {media.author && <InfoRow label="Creator" value={media.author} />}
            {media.rating != null && media.rating > 0 && (
              <InfoRow
                label="Rating"
                value={`${(media.rating / 10).toFixed(1)} / 10`}
              />
            )}
            {media.runtime != null && (
              <InfoRow
                label={
                  media.media_type === "film"
                    ? "Runtime"
                    : media.media_type === "book"
                    ? "Pages"
                    : "Episodes"
                }
                value={String(media.runtime)}
              />
            )}
            {media.status_text && (
              <InfoRow label="Status" value={media.status_text} />
            )}
          </div>

          {/* Share button */}
          <motion.button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-fey-surface py-2.5 text-[12px] font-medium text-cream/40 hover:text-cream/70 transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            <Share2 size={13} /> Share
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-cream/25">{label}</span>
      <span className="text-[11.5px] font-medium text-cream/60">{value}</span>
    </div>
  );
}
