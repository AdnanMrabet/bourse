'use client';

import { useMemo } from 'react';
import { formatPrice } from '@/lib/format';

interface PriceChartProps {
  prices: number[];
  height?: number;
  highlightLast?: boolean;
}

// The full price history as a layered line chart: faint depth grid, a glowing
// price trail, the opening reference, and a marker on the latest print. Colors
// resolve green when the close sits at or above the open, red otherwise.
export default function PriceChart({ prices, height = 240, highlightLast }: PriceChartProps) {
  const W = 720;
  const H = height;
  const padX = 16;
  const padY = 22;

  const model = useMemo(() => {
    const data = prices && prices.length > 0 ? prices : [1000];
    const series = data.length === 1 ? [data[0], data[0]] : data;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const span = max - min || 1;
    const usableW = W - padX * 2;
    const usableH = H - padY * 2;
    const stepX = usableW / (series.length - 1);

    const coords = series.map((v, i) => {
      const x = padX + i * stepX;
      const y = padY + (1 - (v - min) / span) * usableH;
      return [x, y] as const;
    });
    const line = coords
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ');
    const area = `${line} L${padX + usableW},${H - padY} L${padX},${H - padY} Z`;
    const open = series[0];
    const openY = padY + (1 - (open - min) / span) * usableH;
    const up = series[series.length - 1] >= open;
    return { coords, line, area, openY, up, min, max, last: series[series.length - 1] };
  }, [prices, H]);

  const stroke = model.up ? '#34f5c5' : '#ff5470';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      role="img"
      aria-label="Price history chart"
    >
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={padX}
          x2={W - padX}
          y1={padY + f * (H - padY * 2)}
          y2={padY + f * (H - padY * 2)}
          stroke="rgba(120,150,220,0.1)"
          strokeWidth="1"
        />
      ))}

      <line
        x1={padX}
        x2={W - padX}
        y1={model.openY}
        y2={model.openY}
        stroke="rgba(139,150,191,0.5)"
        strokeWidth="1"
        strokeDasharray="4 5"
      />

      <path d={model.area} fill="url(#chart-fill)" />
      <path
        d={model.line}
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 8px ${stroke}88)` }}
      />

      {highlightLast && (
        <circle
          cx={model.coords[model.coords.length - 1][0]}
          cy={model.coords[model.coords.length - 1][1]}
          r="4.5"
          fill={stroke}
          style={{ filter: `drop-shadow(0 0 10px ${stroke})` }}
        />
      )}

      <text x={padX} y={14} fontSize="11" fill="#8b96bf" fontFamily="var(--font-mono)">
        {formatPrice(model.max)}
      </text>
      <text x={padX} y={H - 6} fontSize="11" fill="#8b96bf" fontFamily="var(--font-mono)">
        {formatPrice(model.min)}
      </text>
    </svg>
  );
}
