'use client';

import { MessageSquarePlus, Activity } from 'lucide-react';
import { AssetSummary } from '@/lib/contract';
import { formatPrice, percentMove, formatPercent, direction, moveColor, formatInt } from '@/lib/format';
import Sparkline from './Sparkline';

interface AssetCardProps {
  asset: AssetSummary;
  onOpen: (asset: AssetSummary) => void;
  onPitch: (asset: AssetSummary) => void;
}

// A layered glass trading card. The price reads in display units (points / 10),
// the move is colored against the opening print, and the sparkline traces the
// recent tape. Opening the card reveals the full price history.
export default function AssetCard({ asset, onOpen, onPitch }: AssetCardProps) {
  const pct = percentMove(asset.price, asset.open_price);
  const dir = direction(asset.price - asset.open_price);
  const c = moveColor(dir);

  return (
    <article
      className="glass group relative flex flex-col p-5 transition-transform duration-200 hover:-translate-y-1"
      style={{ boxShadow: `0 30px 70px -50px ${c}55, 0 1px 0 rgba(255,255,255,0.05) inset` }}
    >
      <button
        type="button"
        onClick={() => onOpen(asset)}
        className="flex-1 text-left"
        aria-label={`Open ${asset.name} history`}
        style={{ minHeight: 0 }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-bold leading-snug" style={{ color: '#fff' }}>
            {asset.name}
          </h3>
          <span
            className="tnum flex-shrink-0 rounded-md px-2 py-1 font-mono text-xs"
            style={{ background: `${c}1a`, color: c, border: `1px solid ${c}40` }}
          >
            {formatPercent(pct)}
          </span>
        </div>

        <div className="mb-4 flex items-end gap-2">
          <span className="tnum font-display text-3xl font-extrabold" style={{ color: 'var(--ink)' }}>
            {formatPrice(asset.price)}
          </span>
          <span className="mb-1 font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
            pts
          </span>
        </div>

        <div className="mb-4">
          <Sparkline values={asset.spark} width={260} height={48} />
        </div>

        <div className="flex items-center justify-between font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
          <span className="inline-flex items-center gap-1.5">
            <Activity size={13} aria-hidden />
            {formatInt(asset.pitches)} {asset.pitches === 1 ? 'pitch' : 'pitches'}
          </span>
          <span className="tnum">open {formatPrice(asset.open_price)}</span>
        </div>
      </button>

      <button
        type="button"
        className="btn btn-ghost mt-4 w-full"
        onClick={() => onPitch(asset)}
      >
        <MessageSquarePlus size={16} aria-hidden />
        Pitch a thesis
      </button>
    </article>
  );
}
