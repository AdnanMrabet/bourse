'use client';

import { Plus, TrendingUp, Activity, Layers, Flame } from 'lucide-react';
import { AssetSummary, Stats } from '@/lib/contract';
import {
  formatInt,
  formatPrice,
  percentMove,
  formatPercent,
  direction,
  moveColor,
} from '@/lib/format';
import Sparkline from './Sparkline';

interface MarketOverviewProps {
  stats: Stats | null;
  assets: AssetSummary[];
  network: string;
  loading: boolean;
  onList: () => void;
  onExplore: () => void;
  onOpen: (asset: AssetSummary) => void;
  onPitch: (asset: AssetSummary) => void;
}

// Pick the asset with the largest absolute percent move against its open print.
function topMover(assets: AssetSummary[]): AssetSummary | null {
  if (assets.length === 0) return null;
  return assets.reduce((best, a) => {
    const ab = Math.abs(percentMove(a.price, a.open_price));
    const bb = Math.abs(percentMove(best.price, best.open_price));
    return ab > bb ? a : best;
  }, assets[0]);
}

// A compact trading dashboard strip that opens the page with live data instead
// of a tall marketing hero. Market indices sit beside the single hottest tile,
// and the primary list action is immediately at hand.
export default function MarketOverview({
  stats,
  assets,
  network,
  loading,
  onList,
  onExplore,
  onOpen,
  onPitch,
}: MarketOverviewProps) {
  const mover = topMover(assets);
  const moverPct = mover ? percentMove(mover.price, mover.open_price) : 0;
  const moverDir = mover ? direction(mover.price - mover.open_price) : 'flat';
  const moverColor = moveColor(moverDir);

  const assetCount = stats ? formatInt(stats.assets) : loading ? '...' : '0';
  const pitchCount = stats ? formatInt(stats.pitches) : loading ? '...' : '0';

  return (
    <section
      id="overview"
      className="mx-auto max-w-7xl px-5 pb-6 pt-24 sm:pt-28"
      aria-label="Market overview"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="chip">
          <span className="dot live-dot" aria-hidden />
          {network}
        </span>
        <button type="button" className="btn btn-primary" onClick={onList}>
          <Plus size={16} aria-hidden />
          List an idea
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.35fr]">
        {/* Indices: the running counts that define the board at a glance. */}
        <div className="grid grid-cols-2 gap-4">
          <Index
            label="Listed assets"
            value={assetCount}
            Icon={Layers}
            accent="var(--cyan)"
            hint="ideas on the board"
          />
          <Index
            label="Theses pitched"
            value={pitchCount}
            Icon={Activity}
            accent="var(--up)"
            hint="arguments ruled on chain"
          />
          <div className="glass-2 col-span-2 flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                The market
              </p>
              <p className="mt-1 font-display text-base font-bold" style={{ color: '#fff' }}>
                Prices move on argument, not capital
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost flex-shrink-0"
              onClick={onExplore}
              aria-label="Jump to the asset board"
            >
              <TrendingUp size={15} aria-hidden />
              View board
            </button>
          </div>
        </div>

        {/* Top mover: the single asset furthest from its open, featured. */}
        <div className="glass relative overflow-hidden p-5" style={{ boxShadow: `0 30px 80px -55px ${moverColor}66` }}>
          <p className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: moverColor }}>
            <Flame size={13} aria-hidden /> Top mover
          </p>

          {mover ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => onOpen(mover)}
                className="min-w-0 flex-1 text-left"
                aria-label={`Open ${mover.name} history`}
                style={{ minHeight: 0 }}
              >
                <h3 className="truncate font-display text-xl font-bold" style={{ color: '#fff' }}>
                  {mover.name}
                </h3>
                <div className="mt-2 flex items-end gap-3">
                  <span className="tnum font-display text-4xl font-extrabold" style={{ color: 'var(--ink)' }}>
                    {formatPrice(mover.price)}
                  </span>
                  <span
                    className="tnum mb-1.5 rounded-md px-2 py-0.5 font-mono text-sm"
                    style={{ background: `${moverColor}1a`, color: moverColor, border: `1px solid ${moverColor}40` }}
                  >
                    {formatPercent(moverPct)}
                  </span>
                </div>
                <div className="mt-3">
                  <Sparkline values={mover.spark} width={300} height={52} />
                </div>
              </button>
              <button
                type="button"
                className="btn btn-ghost flex-shrink-0 sm:self-end"
                onClick={() => onPitch(mover)}
              >
                Pitch a thesis
              </button>
            </div>
          ) : (
            <div className="flex min-h-[150px] flex-col items-start justify-center gap-3">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                The tape is quiet. No ideas have been listed yet, so there is nothing to move.
              </p>
              <button type="button" className="btn btn-primary" onClick={onList}>
                <Plus size={16} aria-hidden />
                Open the first market
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Index({
  label,
  value,
  Icon,
  accent,
  hint,
}: {
  label: string;
  value: string;
  Icon: typeof Layers;
  accent: string;
  hint: string;
}) {
  return (
    <div className="glass-2 p-4">
      <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        <Icon size={13} aria-hidden style={{ color: accent }} />
        {label}
      </p>
      <p className="tnum mt-2 font-display text-3xl font-extrabold" style={{ color: 'var(--ink)' }}>
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
        {hint}
      </p>
    </div>
  );
}
