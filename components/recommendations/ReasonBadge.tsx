"use client";

import { motion } from "framer-motion";

interface ReasonBadgeProps {
  reason: string;
  reasonType: "taste" | "genre" | "cross_medium" | "trending" | "friends";
}

const TYPE_COLORS = {
  taste: "#c8a44e",
  genre: "#7b9ec9",
  cross_medium: "#b088c9",
  trending: "#d4a574",
  friends: "#a0c4a8",
};

const TYPE_LABELS = {
  taste: "Your Taste",
  genre: "Genre Match",
  cross_medium: "Cross-Medium",
  trending: "Trending",
  friends: "Friends",
};

export function ReasonBadge({ reason, reasonType }: ReasonBadgeProps) {
  const color = TYPE_COLORS[reasonType] || "#c8a44e";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
      style={{
        background: `${color}0c`,
        border: `1px solid ${color}15`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color }}>
        {TYPE_LABELS[reasonType]}
      </span>
      <span className="text-[9.5px] text-cream/35">{reason}</span>
    </motion.div>
  );
}
