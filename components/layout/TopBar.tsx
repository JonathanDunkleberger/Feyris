"use client";

import { Bell, SlidersHorizontal } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { SearchBar } from "./SearchBar";
import { useAppStore } from "@/stores/app-store";

export function TopBar() {
  const { user } = useUser();
  const { sidebarOpen } = useAppStore();

  const firstName = user?.firstName || user?.username || "Explorer";

  return (
    <header
      className="fixed top-0 right-0 z-50 flex h-14 items-center justify-between border-b border-gold/[0.04] px-6 transition-all duration-300"
      style={{
        left: sidebarOpen ? 212 : 62,
        background:
          "linear-gradient(90deg, rgba(14,14,20,0.97), rgba(10,10,14,0.99))",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Greeting */}
      <div className="hidden md:block">
        <h2 className="text-[13.5px] font-bold text-cream">
          Welcome back,{" "}
          <span className="gradient-gold">{firstName}</span>
        </h2>
      </div>

      {/* Search */}
      <div className="flex-1 md:flex-none md:mx-auto">
        <SearchBar />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="relative rounded-lg p-2 text-cream/25 transition-colors hover:bg-gold/[0.04] hover:text-cream/40">
          <Bell size={15} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
        </button>
        <button className="rounded-lg p-2 text-cream/25 transition-colors hover:bg-gold/[0.04] hover:text-cream/40">
          <SlidersHorizontal size={15} />
        </button>
      </div>
    </header>
  );
}
