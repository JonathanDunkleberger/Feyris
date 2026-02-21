export function ProgressBar({
  progress,
  color = "#c8a44e",
  height = 3,
}: {
  progress: number;
  color?: string;
  height?: number;
}) {
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{
        height,
        background: "rgba(255,255,255,0.045)",
      }}
    >
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${Math.min(Math.max(progress, 0), 100)}%`,
          background: `linear-gradient(90deg, ${color}, ${color}70)`,
        }}
      />
    </div>
  );
}
