'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, X, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useContractData } from '@/hooks/useContractData';
import {
  AssetSummary,
  AssetRecord,
  fetchAsset,
} from '@/lib/contract';
import {
  formatPrice,
  percentMove,
  formatPercent,
  formatSignedPoints,
  direction,
  moveColor,
  stanceStyle,
  shortAddress,
} from '@/lib/format';
import { ToastProvider } from '@/components/Toast';
import TickerHeader from '@/components/TickerHeader';
import MarketOverview from '@/components/MarketOverview';
import PitchTape from '@/components/PitchTape';
import PricingNote from '@/components/PricingNote';
import BiggestMoves from '@/components/BiggestMoves';
import AssetCard from '@/components/AssetCard';
import Skeleton from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import ListModal from '@/components/ListModal';
import PitchModal from '@/components/PitchModal';
import PriceChart from '@/components/PriceChart';
import LayeredFooter from '@/components/LayeredFooter';

const NETWORK = 'Bradbury Testnet';

export default function Page() {
  return (
    <ToastProvider>
      <Floor />
    </ToastProvider>
  );
}

function Floor() {
  const wallet = useWallet();
  const data = useContractData();

  const [listOpen, setListOpen] = useState(false);
  const [pitchAsset, setPitchAsset] = useState<AssetSummary | null>(null);
  const [detailAsset, setDetailAsset] = useState<AssetSummary | null>(null);

  const scrollToBoard = useCallback(() => {
    document.getElementById('market')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // One refresh after a confirmed write, then polling resumes.
  const afterConfirm = useCallback(() => {
    window.setTimeout(() => data.refresh(), 1200);
  }, [data]);

  return (
    <>
      <TickerHeader assets={data.assets} wallet={wallet} onList={() => setListOpen(true)} />

      <main>
        {/* 1. Market-overview band: live indices + top mover, no tall hero. */}
        <MarketOverview
          stats={data.stats}
          assets={data.assets}
          network={NETWORK}
          loading={data.loading}
          onList={() => setListOpen(true)}
          onExplore={scrollToBoard}
          onOpen={setDetailAsset}
          onPitch={setPitchAsset}
        />

        {/* 2. The asset board: the full grid, placed high. */}
        <section id="market" className="mx-auto max-w-7xl px-5 pb-10 pt-2" aria-label="The asset board">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--cyan)' }}>
                The board
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-5xl" style={{ color: '#fff' }}>
                Ideas trading on argument
              </h2>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => data.refresh()}
              disabled={data.loading}
              aria-label="Refresh the market"
            >
              <RefreshCw size={15} aria-hidden className={data.loading ? 'live-dot' : undefined} />
              Refresh tape
            </button>
          </div>

          {data.loading && data.assets.length === 0 ? (
            <Skeleton slow={data.slow} />
          ) : data.error && data.assets.length === 0 ? (
            <ErrorState message={data.error} diagnostic={data.diagnostic} onRetry={() => data.refresh()} />
          ) : data.assets.length === 0 ? (
            <EmptyState onList={() => setListOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.assets.map((a) => (
                <AssetCard key={a.id} asset={a} onOpen={setDetailAsset} onPitch={setPitchAsset} />
              ))}
            </div>
          )}
        </section>

        {/* 3. Split: live pitch tape beside a compact pricing prospectus. */}
        <section className="mx-auto max-w-7xl px-5 py-10" aria-label="Pitch tape and pricing">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <PitchTape assets={data.assets} onOpen={setDetailAsset} />
            <PricingNote onList={() => setListOpen(true)} />
          </div>
        </section>

        {/* 4. Biggest moves: top gainers and losers as horizontal rails. */}
        <BiggestMoves assets={data.assets} onOpen={setDetailAsset} />
      </main>

      <LayeredFooter />

      <ListModal
        open={listOpen}
        wallet={wallet}
        onClose={() => setListOpen(false)}
        onConfirmed={afterConfirm}
        setBusy={data.setBusy}
      />
      <PitchModal
        open={!!pitchAsset}
        asset={pitchAsset}
        wallet={wallet}
        onClose={() => setPitchAsset(null)}
        onConfirmed={afterConfirm}
        setBusy={data.setBusy}
      />
      <AssetDetail
        asset={detailAsset}
        onClose={() => setDetailAsset(null)}
        onPitch={(a) => {
          setDetailAsset(null);
          setPitchAsset(a);
        }}
      />
    </>
  );
}

// Opening a card reveals the full price history as a chart plus the pitch log.
function AssetDetail({
  asset,
  onClose,
  onPitch,
}: {
  asset: AssetSummary | null;
  onClose: () => void;
  onPitch: (a: AssetSummary) => void;
}) {
  const [record, setRecord] = useState<AssetRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!asset) {
      setRecord(null);
      return;
    }
    setLoading(true);
    fetchAsset(asset.id)
      .then((r) => {
        if (alive) setRecord(r);
      })
      .catch(() => {
        /* fall back to the summary spark */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [asset]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (asset) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [asset, onClose]);

  if (!asset) return null;

  const price = record ? record.price : asset.price;
  const open = record ? record.open_price : asset.open_price;
  const pct = percentMove(price, open);
  const dir = direction(price - open);
  const c = moveColor(dir);
  const prices = record ? record.history.map((h) => h.price) : asset.spark;
  const log = record ? [...record.history].filter((h) => h.stance !== 'OPEN').reverse() : [];

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`${asset.name} detail`}>
      <div className="absolute inset-0" style={{ background: 'rgba(3,6,16,0.78)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div className="glass rise relative z-10 flex max-h-[92svh] w-full flex-col overflow-y-auto p-6 sm:max-w-2xl sm:rounded-2xl" style={{ borderColor: 'rgba(34,211,238,0.28)' }}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold" style={{ color: '#fff' }}>{asset.name}</h2>
            <p className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
              listed by {shortAddress(record?.lister ?? '')}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ color: 'var(--muted)', flexShrink: 0 }}>
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="mb-4 flex items-end gap-3">
          <span className="tnum font-display text-4xl font-extrabold" style={{ color: 'var(--ink)' }}>{formatPrice(price)}</span>
          <span className="tnum mb-1.5 rounded-md px-2 py-0.5 font-mono text-sm" style={{ background: `${c}1a`, color: c, border: `1px solid ${c}40` }}>
            {formatPercent(pct)}
          </span>
        </div>

        <div className="glass-2 mb-5 p-3">
          <PriceChart prices={prices} height={210} highlightLast />
        </div>

        <button type="button" className="btn btn-primary mb-5 w-full" onClick={() => onPitch(asset)}>
          Pitch a thesis on this idea
        </button>

        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>
          Pitch log
        </p>
        {loading ? (
          <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Reading the tape</p>
        ) : log.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No thesis has moved this idea yet. The board is waiting for the first argument.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {log.map((h) => {
              const ss = stanceStyle(h.stance);
              const hd = direction(h.delta);
              const hc = moveColor(hd);
              const Icon = hd === 'up' ? ArrowUpRight : hd === 'down' ? ArrowDownRight : Minus;
              return (
                <li key={h.n} className="glass-2 p-3.5">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="rounded px-2 py-0.5 font-mono text-[11px]" style={{ background: `${ss.color}1a`, color: ss.color, border: `1px solid ${ss.color}40` }}>
                        {ss.label}
                      </span>
                      <span className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
                        {shortAddress(h.actor)}
                      </span>
                    </span>
                    <span className="tnum inline-flex items-center gap-1 font-mono text-xs" style={{ color: hc }}>
                      <Icon size={13} aria-hidden />
                      {formatSignedPoints(h.delta)} to {formatPrice(h.price)}
                    </span>
                  </div>
                  {h.snippet && (
                    <p className="text-sm" style={{ color: 'var(--ink)' }}>
                      &ldquo;{h.snippet}&rdquo;
                    </p>
                  )}
                  {h.note && (
                    <p className="mt-1 font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
                      Analyst: {h.note}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-5 text-center font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
          asset {asset.id}
        </p>
      </div>
    </div>
  );
}
