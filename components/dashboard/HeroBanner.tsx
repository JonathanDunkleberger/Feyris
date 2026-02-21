"use client";

import { Sparkles, Compass } from "lucide-react";
import { CatLogo } from "@/components/shared/CatLogo";
import Link from "next/link";

interface HeroBannerProps {
  userName: string;
  activeCount?: number;
}

export function HeroBanner({ userName, activeCount = 0 }: HeroBannerProps) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-gold/[0.05]"
      style={{
        background: "linear-gradient(135deg, rgba(18,16,28,1), rgba(24,20,34,1))",
        height: 224,
      }}
    >
      {/* Radial glows */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 75% 50%, rgba(200,164,78,0.08), transparent 60%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(123,158,201,0.05), transparent 60%)" }} />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-8 py-8">
        <div className="mb-[7px] flex items-center gap-[5px] text-[9.5px] font-bold uppercase tracking-[3px] text-gold">
          <Sparkles size={12} /> Welcome back, {userName}
        </div>
        <h1 className="mb-[5px] text-[30px] font-black leading-tight tracking-tight text-cream">
          Your unified media universe
        </h1>
        <p className="max-w-[440px] text-[12.5px] leading-relaxed text-cream/40">
          Track everything you watch, play, and read in one place.
          {activeCount > 0 &&
            ` Currently tracking ${activeCount} active title${activeCount !== 1 ? "s" : ""} across all mediums.`}
        </p>
        <div className="mt-4 flex gap-[7px]">
          <Link
            href="/discover"
            className="flex items-center gap-[5px] rounded-[9px] border-none px-[18px] py-[9px] text-[11.5px] font-bold text-fey-black transition-transform active:scale-[0.96]"
            style={{
              background: "linear-gradient(135deg, #c8a44e, #a0832e)",
            }}
          >
            <Compass size={14} /> Discover New
          </Link>
          <Link
            href="/wrapped"
            className="flex items-center gap-[5px] rounded-[9px] border border-gold/10 bg-gold/[0.05] px-[18px] py-[9px] text-[11.5px] font-semibold text-gold"
          >
            <Sparkles size={13} /> View Wrapped
          </Link>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute -bottom-[14px] right-8 opacity-[0.035]">
        <CatLogo size={190} />
      </div>
    </div>
  );
}
