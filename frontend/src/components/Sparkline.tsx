interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}

// A compact price trail drawn as an SVG polyline with a soft area fill. Colors
// follow the trend: green when the last print is at or above the first.
export default function Sparkline({ values, width = 132, height = 40, color }: SparklineProps) {
  const pts = values && values.length > 0 ? values : [1000];
  const data = pts.length === 1 ? [pts[0], pts[0]] : pts;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = 3;
  const usable = height - pad * 2;

  const coords = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + (1 - (v - min) / span) * usable;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  const trend = data[data.length - 1] >= data[0] ? '#34f5c5' : '#ff5470';
  const stroke = color ?? trend;
  const gid = `spark-${stroke.replace('#', '')}-${Math.round(width)}-${Math.round(height)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coords[coords.length - 1][0]}
        cy={coords[coords.length - 1][1]}
        r="2.4"
        fill={stroke}
      />
    </svg>
  );
}
