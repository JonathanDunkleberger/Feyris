"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
}

export function RatingInput({
  value,
  onChange,
  max = 10,
  size = "md",
  label,
  showValue = true,
}: RatingInputProps) {
  const sizes = {
    sm: { star: 12, text: "text-[10px]", gap: "gap-0.5" },
    md: { star: 18, text: "text-[13px]", gap: "gap-1" },
    lg: { star: 24, text: "text-[16px]", gap: "gap-1.5" },
  };
  const s = sizes[size];

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-[11px] font-medium text-cream/40">
          {label}
        </label>
      )}
      <div className={`flex items-center ${s.gap}`}>
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < value;
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => onChange(i + 1 === value ? 0 : i + 1)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              className="transition-colors"
              style={{
                color: filled ? "#c8a44e" : "rgba(240,235,224,0.1)",
              }}
            >
              <Star
                size={s.star}
                fill={filled ? "#c8a44e" : "transparent"}
                strokeWidth={filled ? 0 : 1}
              />
            </motion.button>
          );
        })}
        {showValue && value > 0 && (
          <span className={`ml-1.5 font-bold text-gold ${s.text}`}>
            {value}/{max}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Slider-based 10-point rating (alternative) ────────────────────────────
interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function RatingSlider({ value, onChange, label }: RatingSliderProps) {
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-[11px] font-medium text-cream/40">
            {label}
          </label>
          <span className="text-[12px] font-bold text-gold">
            {value > 0 ? `${value}/10` : "—"}
          </span>
        </div>
      )}
      <div className="relative">
        <div className="h-[6px] rounded-full bg-white/[0.04] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #8a7235, #c8a44e, #e8d5a0)",
            }}
            animate={{ width: `${(value / 10) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
        {/* Tick marks */}
        <div className="mt-1 flex justify-between px-0.5">
          {Array.from({ length: 11 }).map((_, i) => (
            <span
              key={i}
              className="text-[7px] text-cream/15"
              style={{ color: i <= value && value > 0 ? "#c8a44e" : undefined }}
            >
              {i}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
