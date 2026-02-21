"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5); // Show first 5 on mobile

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex h-16 items-center justify-around border-t border-gold/[0.06] md:hidden"
      style={{
        background: "linear-gradient(180deg, rgba(14,14,20,0.98), rgba(10,10,14,1))",
        backdropFilter: "blur(20px)",
      }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col items-center gap-0.5 transition-colors"
          >
            <div
              className={`rounded-lg p-1.5 transition-all ${
                isActive ? "bg-gold/10" : ""
              }`}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.5}
                className={
                  isActive ? "text-gold" : "text-cream/30"
                }
              />
            </div>
            <span
              className={`text-[9px] font-semibold ${
                isActive ? "text-gold" : "text-cream/25"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
