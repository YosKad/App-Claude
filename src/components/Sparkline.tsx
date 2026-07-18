// A small area chart used on the Home screen. Pure SVG, no dependencies.
export function Sparkline() {
  return (
    <svg
      width="100%"
      height="90"
      viewBox="0 0 286 90"
      preserveAspectRatio="none"
      role="img"
      aria-label="Monthly subscription spend trend"
    >
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2dd4bf" stopOpacity=".4" />
          <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,60 C28,56 44,34 72,38 C100,42 116,64 144,56 C172,48 188,24 216,30 C244,36 262,49 286,42 L286,90 L0,90 Z"
        fill="url(#spark)"
      />
      <path
        d="M0,60 C28,56 44,34 72,38 C100,42 116,64 144,56 C172,48 188,24 216,30 C244,36 262,49 286,42"
        fill="none"
        stroke="#2dd4bf"
        strokeWidth="2.5"
      />
      <circle cx="216" cy="30" r="4.5" fill="#2dd4bf" stroke="#0c1116" strokeWidth="2" />
    </svg>
  );
}
