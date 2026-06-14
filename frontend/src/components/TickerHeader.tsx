'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { AssetSummary } from '@/lib/contract';
import { WalletState } from '@/hooks/useWallet';
import { formatPrice, percentMove, formatPercent, direction, moveColor } from '@/lib/format';
import Mark from './Mark';
import WalletControl from './WalletControl';

interface TickerHeaderProps {
  assets: AssetSummary[];
  wallet: WalletState;
  onList: () => void;
}

// Two-state chrome. At the top it is a full bar with the wordmark, tagline, and
// actions. As the page scrolls it collapses into a slim live ticker strip whose
// prices scroll across, with the wallet control docked at the right edge.
export default function TickerHeader({ assets, wallet, onList }: TickerHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tape = assets.length > 0 ? [...assets, ...assets] : [];

  return (
    <header
      className="fixed inset-x-0 top-0 z-[100] transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(7,11,26,0.82)' : 'rgba(7,11,26,0.35)',
        borderBottom: `1px solid ${scrolled ? 'rgba(34,211,238,0.22)' : 'var(--line)'}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Full bar: shown at the top, collapses away on scroll */}
      <div
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6"
        style={{
          height: scrolled ? 0 : 72,
          opacity: scrolled ? 0 : 1,
          overflow: 'hidden',
          pointerEvents: scrolled ? 'none' : 'auto',
        }}
      >
        <a href="#top" className="flex items-center gap-3" aria-label="Bourse home">
          <Mark size={32} />
          <span className="font-display text-lg font-extrabold tracking-wide" style={{ color: '#fff' }}>
            BOURSE
          </span>
          <span className="hidden font-mono text-[11px] sm:inline" style={{ color: 'var(--muted)' }}>
            trades on argument
          </span>
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" className="btn btn-ghost" onClick={onList}>
            <Plus size={16} aria-hidden />
            List or pitch
          </button>
          <WalletControl wallet={wallet} />
        </div>
      </div>

      {/* Slim ticker strip: revealed on scroll */}
      <div
        className="mx-auto flex max-w-7xl items-center gap-3 px-2 transition-all duration-300 sm:px-4"
        style={{
          height: scrolled ? 50 : 0,
          opacity: scrolled ? 1 : 0,
          overflow: 'hidden',
          pointerEvents: scrolled ? 'auto' : 'none',
        }}
      >
        <a href="#top" className="flex flex-shrink-0 items-center gap-2" aria-label="Bourse home">
          <Mark size={22} />
          <span className="hidden font-display text-sm font-bold sm:inline" style={{ color: '#fff' }}>
            BOURSE
          </span>
        </a>

        <div className="relative flex-1 overflow-hidden" role="marquee" aria-label="Live asset prices">
          {tape.length > 0 ? (
            <div className="ticker-track">
              {tape.map((a, i) => {
                const pct = percentMove(a.price, a.open_price);
                const dir = direction(a.price - a.open_price);
                const c = moveColor(dir);
                return (
                  <span key={`${a.id}-${i}`} className="inline-flex items-center gap-2 px-4 font-mono text-xs">
                    <span style={{ color: 'var(--muted)' }}>{a.name.slice(0, 22)}</span>
                    <span className="tnum" style={{ color: 'var(--ink)' }}>
                      {formatPrice(a.price)}
                    </span>
                    <span className="tnum" style={{ color: c }}>
                      {formatPercent(pct)}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="px-4 font-mono text-xs" style={{ color: 'var(--muted)' }}>
              The tape is quiet. No ideas listed yet.
            </span>
          )}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-10"
            style={{ background: 'linear-gradient(90deg, rgba(7,11,26,0.9), transparent)' }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-10"
            style={{ background: 'linear-gradient(270deg, rgba(7,11,26,0.9), transparent)' }}
          />
        </div>

        <div className="flex-shrink-0">
          <WalletControl wallet={wallet} compact />
        </div>
      </div>
    </header>
  );
}
