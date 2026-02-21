export function CatLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path
        d="M8 38V16L14 6l4 8h12l4-8 6 10v22c0 2-2 4-6 4H14c-4 0-6-2-6-4z"
        fill="url(#cg)"
        opacity="0.9"
      />
      <path
        d="M14 6l4 8h12l4-8"
        stroke="#c8a44e"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="18" cy="24" r="2.2" fill="#0a0a0f" />
      <circle cx="30" cy="24" r="2.2" fill="#0a0a0f" />
      <path
        d="M21 30q3 2.5 6 0"
        stroke="#0a0a0f"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M20 28l16-4.5M20 28l-12-4.5M28 28l-12-4.5M28 28l16-4.5"
        stroke="#c8a44e"
        strokeWidth="0.4"
        opacity="0.25"
      />
      <defs>
        <linearGradient id="cg" x1="8" y1="6" x2="40" y2="42">
          <stop offset="0%" stopColor="#c8a44e" />
          <stop offset="100%" stopColor="#8a7235" />
        </linearGradient>
      </defs>
    </svg>
  );
}
