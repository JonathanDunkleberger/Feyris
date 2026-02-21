"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { CatLogo } from "@/components/shared/CatLogo";
import { NAV_ITEMS } from "@/lib/constants";
import { useAppStore } from "@/stores/app-store";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user?.username?.slice(0, 2)?.toUpperCase() || "FY";

  return (
    <nav
      className="f-sidebar fixed left-0 top-0 z-[100] flex min-h-screen flex-col border-r border-gold/[0.04] transition-all duration-300"
      style={{
        width: sidebarOpen ? 212 : 62,
        background:
          "linear-gradient(180deg, rgba(14,14,20,0.99), rgba(10,10,14,1))",
      }}
    >
      {/* Logo */}
      <div
        className="flex cursor-pointer items-center gap-2.5 px-3.5 py-4 mb-2"
        onClick={toggleSidebar}
      >
        <CatLogo size={32} />
        {sidebarOpen && (
          <span className="text-xl font-black tracking-tight gradient-gold">
            Feyris
          </span>
        )}
      </div>

      {/* Nav items */}
      <div className="flex flex-1 flex-col gap-0.5 px-2">
        {sidebarOpen && (
          <div className="px-2.5 pb-1.5 text-[8.5px] font-bold uppercase tracking-[2px] text-cream/[0.17]">
            Menu
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex items-center gap-2.5 rounded-lg border-none transition-all duration-200 ${
                sidebarOpen ? "justify-start px-3 py-2.5" : "justify-center py-2.5"
              }`}
              style={{
                background: isActive
                  ? "rgba(200,164,78,0.07)"
                  : "transparent",
                color: isActive ? "#c8a44e" : "rgba(224,218,206,0.35)",
                fontSize: 12.5,
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {isActive && (
                <div className="absolute -left-2 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded bg-gold" />
              )}
              <Icon
                size={17}
                strokeWidth={isActive ? 2.2 : 1.5}
              />
              {sidebarOpen && item.label}
            </Link>
          );
        })}
      </div>

      {/* User card */}
      {sidebarOpen && (
        <div className="mx-2 mb-4 rounded-[9px] border border-gold/[0.04] bg-gold/[0.02] p-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark text-[10.5px] font-extrabold text-fey-black">
                {initials}
              </div>
              <div className="flex-1">
                <div className="text-[11.5px] font-bold text-cream">
                  {user.fullName || user.username || "User"}
                </div>
                <div className="text-[9.5px] text-cream/25">
                  Media Enthusiast
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="text-cream/15 hover:text-cream/40 transition-colors"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-2.5 text-[11.5px] font-bold text-gold hover:text-gold-light transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/20 bg-gold/[0.06]">
                <LogOut size={12} className="rotate-180 text-gold" />
              </div>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
