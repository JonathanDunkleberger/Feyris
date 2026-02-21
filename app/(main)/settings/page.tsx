"use client";

import {
  User,
  Bell,
  Link,
  Moon,
  Shield,
  Download,
  ChevronRight,
} from "lucide-react";

const SETTINGS_ITEMS = [
  { label: "Profile", icon: User },
  { label: "Notifications", icon: Bell },
  { label: "Connected Services", icon: Link },
  { label: "Appearance", icon: Moon },
  { label: "Privacy", icon: Shield },
  { label: "Export Data", icon: Download },
];

export default function SettingsPage() {
  return (
    <div className="animate-fadeIn pt-3.5">
      <h1 className="mb-[18px] text-2xl font-extrabold tracking-tight text-cream">
        Settings
      </h1>
      <div
        className="max-w-[460px] rounded-xl border border-white/[0.025] p-[18px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,18,24,0.85), rgba(12,12,18,0.92))",
        }}
      >
        {SETTINGS_ITEMS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex cursor-pointer items-center gap-2.5 py-3 transition-colors hover:text-cream"
              style={{
                borderBottom:
                  i < SETTINGS_ITEMS.length - 1
                    ? "1px solid rgba(255,255,255,0.025)"
                    : "none",
              }}
            >
              <Icon size={15} className="text-cream/25" />
              <span className="flex-1 text-[12.5px] font-medium text-cream">
                {s.label}
              </span>
              <ChevronRight size={14} className="text-cream/15" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
