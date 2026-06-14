'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AssetSummary } from '@/lib/contract';
import {
  formatPrice,
  percentMove,
  formatPercent,
  direction,
  moveColor,
} from '@/lib/format';
import Sparkline from './Sparkline';

interface BiggestMovesProps {
  assets: AssetSummary[];
  onOpen: (asset: AssetSummary) => void;
}

const STRIP = 4;

// A horizontal highlight strip of the day's extremes: top gainers on one rail,
// top losers on the other. Only assets that have actually moved off their open
// qualify, so a flat board collapses gracefully.
export default function BiggestMoves({ assets, onOpen }: BiggestMovesProps) {
  const { gainers, losers } = useMemo(() => {
    const moved = assets
      .map((a) => ({ a, pct: percentMove(a.price, a.open_price) }))
      .filter((x) => x.pct !== 0);
    const gainers = moved
      .filter((x) => x.pct > 0)
      .sort((x, y) => y.pct - x.pct)
      .slice(0, STRIP)
      .map((x) => x.a);
    const losers = moved
      .filter((x) => x.pct < 0)
      .sort((x, y) => x.pct - y.pct)
      .slice(0, STRIP)
      .map((x) => x.a);
    return { gainers, losers };
  }, [assets]);

  if (gainers.length === 0 && losers.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12" aria-label="Biggest moves">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--cyan)' }}>
          Biggest moves
        </p>
        <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl" style={{ color: '#fff' }}>
          The widest swings on the board
        </h2>
      </div>

      <div className="space-y-5">
        <Rail title="Top gainers" Icon={TrendingUp} accent="var(--up)" assets={gainers} onOpen={onOpen} />
        <Rail title="Top losers" Icon={TrendingDown} accent="var(--down)" assets={losers} onOpen={onOpen} />
      </div>
    </section>
  );
}

function Rail({
  title,
  Icon,
  accent,
  assets,
  onOpen,
}: {
  title: string;
  Icon: typeof TrendingUp;
  accent: string;
  assets: AssetSummary[];
  onOpen: (asset: AssetSummary) => void;
}) {
  return (
    <div>
      <p className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
        <Icon size={13} aria-hidden /> {title}
      </p>
      {assets.length === 0 ? (
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          Nothing on this rail yet.
        </p>
      ) : (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
          {assets.map((a) => {
            const pct = percentMove(a.price, a.open_price);
            const dir = direction(a.price - a.open_price);
            const c = moveColor(dir);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onOpen(a)}
                className="glass-2 w-56 flex-shrink-0 p-4 text-left transition-transform duration-150 hover:-translate-y-1"
                style={{ minHeight: 0, boxShadow: `0 24px 60px -50px ${c}66` }}
                aria-label={`Open ${a.name} history`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="truncate font-display text-sm font-bold" style={{ color: '#fff' }}>
                    {a.name}
                  </h3>
                  <span
                    className="tnum flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px]"
                    style={{ background: `${c}1a`, color: c, border: `1px solid ${c}40` }}
                  >
                    {formatPercent(pct)}
                  </span>
                </div>
                <div className="mb-2 flex items-end gap-1.5">
                  <span className="tnum font-display text-2xl font-extrabold" style={{ color: 'var(--ink)' }}>
                    {formatPrice(a.price)}
                  </span>
                  <span className="mb-1 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                    pts
                  </span>
                </div>
                <Sparkline values={a.spark} width={208} height={40} color={c} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
