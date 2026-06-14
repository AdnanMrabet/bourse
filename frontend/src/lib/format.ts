import type { Stance } from './contract';

export function shortAddress(addr: string, lead = 6, tail = 4): string {
  if (!addr) return '';
  if (addr.length <= lead + tail + 2) return addr;
  return `${addr.slice(0, lead)}...${addr.slice(-tail)}`;
}

const intFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatInt(n: number): string {
  return intFormatter.format(Math.round(Number.isFinite(n) ? n : 0));
}

// Prices are integer points; the market displays them divided by ten with a
// single decimal. So 1000 points reads as "100.0".
export function formatPrice(points: number): string {
  const p = Number.isFinite(points) ? points : 0;
  return (p / 10).toFixed(1);
}

// Percent move of a price against its opening price, signed.
export function percentMove(price: number, open: number): number {
  if (!open) return 0;
  return ((price - open) / open) * 100;
}

export function formatPercent(pct: number): string {
  const v = Number.isFinite(pct) ? pct : 0;
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

export function formatSignedPoints(delta: number): string {
  const d = Math.round(Number.isFinite(delta) ? delta : 0);
  const sign = d > 0 ? '+' : '';
  return `${sign}${(d / 10).toFixed(1)}`;
}

export type Direction = 'up' | 'down' | 'flat';

export function direction(value: number): Direction {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

// ---- stance styling -----------------------------------------------------

export interface StanceStyle {
  label: string;
  color: string;
  glow: string;
  dir: Direction;
}

const STANCE_STYLE: Record<string, StanceStyle> = {
  BULLISH: { label: 'Bullish', color: '#34f5c5', glow: 'rgba(52,245,197,0.22)', dir: 'up' },
  BEARISH: { label: 'Bearish', color: '#ff5470', glow: 'rgba(255,84,112,0.22)', dir: 'down' },
  NEUTRAL: { label: 'Neutral', color: '#22d3ee', glow: 'rgba(34,211,238,0.18)', dir: 'flat' },
  OPEN: { label: 'Listed', color: '#8b96bf', glow: 'rgba(139,150,191,0.16)', dir: 'flat' },
};

export function stanceStyle(stance: Stance): StanceStyle {
  return (
    STANCE_STYLE[String(stance).toUpperCase()] ?? {
      label: String(stance || 'Pending'),
      color: '#8b96bf',
      glow: 'rgba(139,150,191,0.16)',
      dir: 'flat',
    }
  );
}

// The price color follows direction of movement: green up, red down, cyan flat.
export function moveColor(dir: Direction): string {
  if (dir === 'up') return '#34f5c5';
  if (dir === 'down') return '#ff5470';
  return '#22d3ee';
}
