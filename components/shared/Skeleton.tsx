"use client";

import { motion } from "framer-motion";

interface SkeletonCardProps {
  count?: number;
}

function SingleSkeleton() {
  return (
    <div
      className="relative overflow-hidden rounded-[10px]"
      style={{ width: 172, height: 248, flex: "0 0 172px" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(18,18,26,0.6) 0%, rgba(30,30,42,0.4) 50%, rgba(18,18,26,0.6) 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
      />
      {/* Type badge skeleton */}
      <div className="absolute left-[7px] top-[7px] h-[14px] w-[42px] rounded-[5px] bg-white/[0.04]" />
      {/* Title skeleton */}
      <div className="absolute bottom-[10px] left-[9px] right-[9px] space-y-[5px]">
        <div className="h-[13px] w-3/4 rounded-[3px] bg-white/[0.06]" />
        <div className="h-[10px] w-1/2 rounded-[3px] bg-white/[0.04]" />
      </div>
    </div>
  );
}

export function SkeletonCard({ count = 8 }: SkeletonCardProps) {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeleton key={i} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: SkeletonCardProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeleton key={i} />
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Hero skeleton */}
      <div className="relative h-[360px] rounded-2xl bg-fey-surface overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(18,18,26,0.6) 0%, rgba(30,30,42,0.4) 50%, rgba(18,18,26,0.6) 100%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {/* Content skeletons */}
      <div className="space-y-3 px-2">
        <div className="h-6 w-2/3 rounded bg-white/[0.04]" />
        <div className="h-4 w-1/3 rounded bg-white/[0.03]" />
        <div className="h-16 w-full rounded bg-white/[0.02]" />
      </div>
    </div>
  );
}
