"use client";

import { CatLogo } from "./CatLogo";

export function FeyrisSpinner({
  size = 48,
  text,
}: {
  size?: number;
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gold/10 border-t-gold animate-spin" />
        {/* Cat */}
        <div className="absolute inset-[6px] flex items-center justify-center">
          <CatLogo size={size - 12} />
        </div>
      </div>
      {text && (
        <span className="text-sm text-cream/30">{text}</span>
      )}
    </div>
  );
}
