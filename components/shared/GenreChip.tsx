export function GenreChip({
  genre,
  color = "#c8a44e",
}: {
  genre: string;
  color?: string;
}) {
  return (
    <span
      className="inline-block text-[10.5px] px-2.5 py-[3px] rounded-[5px] font-medium"
      style={{
        background: `${color}0c`,
        color,
        border: `1px solid ${color}15`,
      }}
    >
      {genre}
    </span>
  );
}
