'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Radio } from 'lucide-react';
import { AssetSummary, HistoryEntry, fetchHistory } from '@/lib/contract';
import {
  formatPrice,
  formatSignedPoints,
  direction,
  moveColor,
  stanceStyle,
  shortAddress,
} from '@/lib/format';

interface PitchTapeProps {
  assets: AssetSummary[];
  onOpen: (asset: AssetSummary) => void;
}

interface TapeRow extends HistoryEntry {
  assetId: string;
  assetName: string;
}

// How many of the busiest markets we read history from for the tape. Capped so
// we lean on the already polled asset list and never hammer the RPC.
const MAX_MARKETS = 5;
const MAX_ROWS = 12;

// A live feed of the most recent theses across every active market. It reads
// history only for the busiest markets, then merges the latest entries from
// each into one descending tape so the floor reads like a running blotter.
export default function PitchTape({ assets, onOpen }: PitchTapeProps) {
  const [rows, setRows] = useState<TapeRow[]>([]);
  const [loading, setLoading] = useState(false);

  // The busiest markets, and a signature that only changes when those markets
  // or their pitch counts change, so we are not refetching on every render.
  const targets = useMemo(
    () =>
      [...assets]
        .filter((a) => a.pitches > 0)
        .sort((a, b) => b.pitches - a.pitches)
        .slice(0, MAX_MARKETS),
    [assets],
  );
  const signature = useMemo(
    () => targets.map((a) => `${a.id}:${a.pitches}`).join('|'),
    [targets],
  );

  const byId = useMemo(() => {
    const m = new Map<string, AssetSummary>();
    for (const a of assets) m.set(a.id, a);
    return m;
  }, [assets]);

  useEffect(() => {
    let alive = true;
    if (targets.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      targets.map((a) =>
        fetchHistory(a.id)
          .then((h) => ({ a, h }))
          .catch(() => ({ a, h: [] as HistoryEntry[] })),
      ),
    )
      .then((results) => {
        if (!alive) return;
        const merged: TapeRow[] = [];
        for (const { a, h } of results) {
          for (const entry of h) {
            if (String(entry.stance).toUpperCase() === 'OPEN') continue;
            merged.push({ ...entry, assetId: a.id, assetName: a.name });
          }
        }
        // No global clock on chain, so order by per-market sequence as a proxy
        // for recency, newest first, and keep the head of the tape.
        merged.sort((x, y) => y.n - x.n);
        setRows(merged.slice(0, MAX_ROWS));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return (
    <div className="glass flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>
          <Radio size={13} aria-hidden /> Live pitch tape
        </p>
        {loading && (
          <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
            reading the tape
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
            {loading
              ? 'Pulling the latest theses across the board.'
              : 'No thesis has moved a market yet. The first argument will print here.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => {
            const ss = stanceStyle(r.stance);
            const hd = direction(r.delta);
            const hc = moveColor(hd);
            const Icon = hd === 'up' ? ArrowUpRight : hd === 'down' ? ArrowDownRight : Minus;
            const asset = byId.get(r.assetId);
            return (
              <li key={`${r.assetId}-${r.n}`}>
                <button
                  type="button"
                  onClick={() => asset && onOpen(asset)}
                  className="glass-2 w-full p-3.5 text-left transition-transform duration-150 hover:-translate-y-0.5"
                  style={{ minHeight: 0 }}
                  aria-label={`Open ${r.assetName} history`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 inline-flex items-center gap-2">
                      <span
                        className="flex-shrink-0 rounded px-2 py-0.5 font-mono text-[11px]"
                        style={{ background: `${ss.color}1a`, color: ss.color, border: `1px solid ${ss.color}40` }}
                      >
                        {ss.label}
                      </span>
                      <span className="truncate font-display text-sm font-bold" style={{ color: '#fff' }}>
                        {r.assetName}
                      </span>
                    </span>
                    <span className="tnum inline-flex flex-shrink-0 items-center gap-1 font-mono text-xs" style={{ color: hc }}>
                      <Icon size={13} aria-hidden />
                      {formatSignedPoints(r.delta)} to {formatPrice(r.price)}
                    </span>
                  </div>
                  {r.snippet && (
                    <p className="mt-1.5 truncate text-sm" style={{ color: 'var(--ink)' }}>
                      &ldquo;{r.snippet}&rdquo;
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                    {shortAddress(r.actor)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
