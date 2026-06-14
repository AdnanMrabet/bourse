'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen, Droplet, ExternalLink, Network } from 'lucide-react';
import { CONTRACT_ADDRESS, DEPLOY_TX, EXPLORER, FAUCET, DOCS } from '@/lib/contract';
import { shortAddress } from '@/lib/format';
import Mark from './Mark';
import Copyable from './Copyable';

// A depth-layered footer: three translucent planes stacked on the z-axis that
// drift at different rates as they enter view, carrying resources, the contract,
// and the network on separate planes rather than flat columns.
export default function LayeredFooter() {
  const ref = useRef<HTMLElement>(null);
  const [t, setT] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the footer top reaches the viewport bottom, grows as it enters.
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      setT(progress);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  const plane = (depth: number) =>
    reduced ? undefined : { transform: `translate3d(0, ${(1 - t) * depth}px, 0)` };

  return (
    <footer ref={ref} className="relative mt-24 overflow-hidden" aria-label="Site footer">
      {/* deep plane glow */}
      <div
        className="parallax pointer-events-none absolute inset-x-0 bottom-0 h-[420px]"
        style={{
          ...plane(60),
          background:
            'radial-gradient(700px 360px at 50% 120%, rgba(34,211,238,0.12), transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-16">
        {/* Plane 1 (front): closing line */}
        <div className="parallax glass relative z-30 mb-[-28px] p-7 sm:p-9" style={plane(8)}>
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Mark size={34} />
              <div>
                <p className="font-display text-xl font-extrabold tracking-wide" style={{ color: '#fff' }}>
                  BOURSE
                </p>
                <p className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
                  the market that trades on argument, not capital
                </p>
              </div>
            </div>
            <span className="chip">
              <span className="dot live-dot" aria-hidden />
              Live on GenLayer Bradbury
            </span>
          </div>
        </div>

        {/* Plane 2 (mid): resources + network */}
        <div className="parallax relative z-20 grid grid-cols-1 gap-4 md:grid-cols-2" style={plane(26)}>
          <div className="glass-2 p-6 pt-10">
            <p className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>
              <BookOpen size={13} aria-hidden /> Resources
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={DOCS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
                  GenLayer documentation <ExternalLink size={12} aria-hidden style={{ color: 'var(--muted)' }} />
                </a>
              </li>
              <li>
                <a href={FAUCET} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
                  <Droplet size={13} aria-hidden style={{ color: 'var(--cyan)' }} /> Testnet faucet <ExternalLink size={12} aria-hidden style={{ color: 'var(--muted)' }} />
                </a>
              </li>
              <li>
                <a href={EXPLORER} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
                  Bradbury explorer <ExternalLink size={12} aria-hidden style={{ color: 'var(--muted)' }} />
                </a>
              </li>
            </ul>
          </div>

          <div className="glass-2 p-6 pt-10">
            <p className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>
              <Network size={13} aria-hidden /> Network
            </p>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt style={{ color: 'var(--muted)' }}>Chain</dt>
                <dd style={{ color: 'var(--ink)' }}>Bradbury Testnet</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt style={{ color: 'var(--muted)' }}>Chain ID</dt>
                <dd className="tnum" style={{ color: 'var(--ink)' }}>4221</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt style={{ color: 'var(--muted)' }}>Currency</dt>
                <dd style={{ color: 'var(--ink)' }}>GEN</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Plane 3 (back): contract identity */}
        <div className="parallax glass-2 relative z-10 mt-4 p-6" style={plane(44)}>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>
            Contract
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Address</p>
              <Copyable value={CONTRACT_ADDRESS} label={shortAddress(CONTRACT_ADDRESS, 10, 8)} />
            </div>
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Deploy transaction</p>
              <Copyable value={DEPLOY_TX} label={shortAddress(DEPLOY_TX, 10, 8)} />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-center sm:flex-row sm:text-left" style={{ borderColor: 'var(--line)' }}>
          <p className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
            No deposits. No custody. The contract holds the book; your browser holds the keys.
          </p>
          <p className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
            Built on GenLayer
          </p>
        </div>
      </div>
    </footer>
  );
}
