import { MEDIA_TYPES, type MediaType } from "@/lib/constants";

export function TypeBadge({
  type,
  size = "sm",
}: {
  type: MediaType;
  size?: "xs" | "sm" | "md";
}) {
  const config = MEDIA_TYPES[type];
  if (!config) return null;
  const Icon = config.icon;

  const sizes = {
    xs: { icon: 9, text: "text-[8px]", px: "px-1.5 py-0.5", gap: "gap-1" },
    sm: { icon: 11, text: "text-[9.5px]", px: "px-2 py-0.5", gap: "gap-1" },
    md: { icon: 13, text: "text-[11px]", px: "px-2.5 py-1", gap: "gap-1.5" },
  };

  const s = sizes[size];

  return (
    <div
      className={`inline-flex items-center ${s.gap} ${s.px} rounded-[5px] font-bold uppercase tracking-wider`}
      style={{
        background: `${config.color}15`,
        border: `1px solid ${config.color}22`,
        color: config.color,
      }}
    >
      <Icon size={s.icon} />
      <span className={s.text}>{config.label}</span>
    </div>
  );
}
