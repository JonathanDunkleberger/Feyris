"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Heart, CheckCircle, Clock } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { CatLogo } from "@/components/shared/CatLogo";
import { useAppStore } from "@/stores/app-store";

export function TopBar() {
  const { isSignedIn } = useUser();
  const { sidebarOpen } = useAppStore();

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
      {/* Logo (visible on small screens where sidebar is hidden) */}
      <div className="flex items-center gap-2 md:hidden">
        <CatLogo size={24} />
        <span className="text-base font-black tracking-tight gradient-gold">
          Feyris
        </span>
      </div>
      <div className="hidden md:block" />

      {/* Search */}
      <div className="flex-1 md:flex-none md:mx-auto">
        <SearchBar />
      </div>

      {/* Auth */}
      <div className="flex items-center gap-2">
        {!isSignedIn ? (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="px-3.5 py-1.5 text-[12.5px] font-semibold text-cream/60 hover:text-cream transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg px-3.5 py-1.5 text-[12.5px] font-bold text-fey-black transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #c8a44e, #c8a44e99)",
                }}
              >
                Sign Up
              </button>
            </SignUpButton>
          </div>
        ) : (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard:
                  "bg-[#12121a] border border-white/[0.06]",
              },
            }}
            afterSignOutUrl="/"
          >
            <UserButton.MenuItems>
              <UserButton.Link
                label="Favorites"
                labelIcon={<Heart size={14} />}
                href="/favorites"
              />
              <UserButton.Link
                label="Library"
                labelIcon={<CheckCircle size={14} />}
                href="/library"
              />
              <UserButton.Link
                label="Watchlist"
                labelIcon={<Clock size={14} />}
                href="/watchlist"
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>
    </header>
  );
}
