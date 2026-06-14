interface MarkProps {
  size?: number;
  title?: string;
}

// Bourse wordmark glyph: a layered candlestick rising through a ring, drawn in
// pure SVG so it carries the neon-terminal identity without any image asset.
export default function Mark({ size = 30, title = 'Bourse' }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mark-up" x1="0" y1="40" x2="40" y2="0">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#34f5c5" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="16.5" stroke="url(#mark-up)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="20" cy="20" r="11" stroke="#22d3ee" strokeWidth="1" opacity="0.25" />
      <line x1="13" y1="26" x2="13" y2="12" stroke="#ff5470" strokeWidth="2" strokeLinecap="round" />
      <rect x="10.5" y="16" width="5" height="7" rx="1" fill="#ff5470" opacity="0.85" />
      <line x1="27" y1="30" x2="27" y2="9" stroke="#34f5c5" strokeWidth="2" strokeLinecap="round" />
      <rect x="24.5" y="13" width="5" height="10" rx="1" fill="url(#mark-up)" />
      <path
        d="M8 24 L16 19 L23 22 L32 11"
        stroke="#22d3ee"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}
