'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Sparkles, TrendingUp } from 'lucide-react';
import { Stats } from '@/lib/contract';
import { formatInt } from '@/lib/format';

interface DepthHeroProps {
  stats: Stats | null;
  network: string;
  onList: () => void;
  onExplore: () => void;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

// Full-viewport hero built from translucent depth planes that parallax against
// the scroll, carrying the immersive scrollytelling open. The narrative of how
// the market works is introduced here and advanced in the section below.
export default function DepthHero({ stats, network, onList, onExplore }: DepthHeroProps) {
  const [offset, setOffset] = useState(0);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  const p = (depth: number) => (reduced ? undefined : { transform: `translate3d(0, ${offset * depth}px, 0)` });

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
      aria-label="Introduction"
    >
      {/* Depth plane: far grid */}
      <div
        className="parallax pointer-events-none absolute inset-0"
        style={{ ...p(0.16), opacity: 0.5 }}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(circle at 50% 38%, black, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 38%, black, transparent 72%)',
          }}
        />
      </div>

      {/* Depth plane: mid floating glass slabs */}
      <div className="parallax pointer-events-none absolute inset-0" style={p(0.3)} aria-hidden>
        <div
          className="glass absolute left-[6%] top-[20%] hidden h-40 w-56 rotate-[-8deg] md:block"
          style={{ opacity: 0.5 }}
        />
        <div
          className="glass absolute right-[8%] top-[26%] hidden h-52 w-44 rotate-[7deg] md:block"
          style={{ opacity: 0.45 }}
        />
        <div
          className="glass absolute bottom-[14%] left-[16%] hidden h-28 w-40 rotate-[5deg] lg:block"
          style={{ opacity: 0.4 }}
        />
      </div>

      {/* Depth plane: near content */}
      <div className="parallax relative z-10 mx-auto w-full max-w-5xl px-5 py-28 text-center" style={p(-0.04)}>
        <div className="mb-6 flex justify-center">
          <span className="chip">
            <span className="dot live-dot" aria-hidden />
            {network}
          </span>
        </div>

        <h1
          className="font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl md:text-7xl"
          style={{ color: '#fff', textShadow: '0 0 50px rgba(34,211,238,0.25)' }}
        >
          The market that prices
          <br />
          <span style={{ color: 'var(--cyan)' }}>ideas on argument</span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg"
          style={{ color: 'var(--muted)' }}
        >
          List any idea as a tradable asset. Instead of buying, you argue. Submit a bull or bear
          thesis and an on-chain AI Analyst rules the call under validator consensus. The price moves
          on the strength of the case, never on the size of a wallet.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" className="btn btn-primary" onClick={onList}>
            <Sparkles size={17} aria-hidden />
            List or pitch an idea
          </button>
          <button type="button" className="btn btn-ghost" onClick={onExplore}>
            <TrendingUp size={17} aria-hidden />
            Read the tape
          </button>
        </div>

        <div className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-3">
          <Chip label="Network" value={network.split(' ')[0] || 'Bradbury'} />
          <Chip label="Assets" value={stats ? formatInt(stats.assets) : '--'} />
          <Chip label="Pitches" value={stats ? formatInt(stats.pitches) : '--'} />
        </div>
      </div>

      <button
        type="button"
        onClick={onExplore}
        aria-label="Scroll to how it works"
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
        style={{ color: 'var(--muted)', minHeight: 0 }}
      >
        <ArrowDown size={22} className="live-dot" aria-hidden />
      </button>
    </section>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-2 px-3 py-3">
      <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p className="tnum mt-1 font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>
        {value}
      </p>
    </div>
  );
}
