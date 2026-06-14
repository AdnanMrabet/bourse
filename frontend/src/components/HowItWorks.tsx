'use client';

import { useEffect, useRef } from 'react';
import { ListPlus, MessagesSquare, ScanLine } from 'lucide-react';

interface Step {
  k: string;
  Icon: typeof ListPlus;
  title: string;
  body: string;
  accent: string;
}

const STEPS: Step[] = [
  {
    k: '01',
    Icon: ListPlus,
    title: 'List an idea',
    body: 'Anyone can open a market on an idea. It lists as a tradable asset at a flat starting price of one hundred. No deposit, no custody, just a name and a conviction that it matters.',
    accent: '#22d3ee',
  },
  {
    k: '02',
    Icon: MessagesSquare,
    title: 'Pitch a thesis',
    body: 'Rather than buying, you make a case. Write a bull or bear thesis on the idea. The argument is the order, and the strength of the reasoning is the size of the position.',
    accent: '#34f5c5',
  },
  {
    k: '03',
    Icon: ScanLine,
    title: 'The Analyst rules',
    body: 'An on-chain AI Analyst weighs the thesis on its merits and rules bullish, bearish, or neutral with a magnitude. Validators independently re-run the call and must agree before the price re-prices on chain.',
    accent: '#22d3ee',
  },
];

// Three scroll-triggered steps in a staggered, deliberately unequal column so
// the narrative reads top to bottom rather than as a uniform card grid.
export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal');
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
      { threshold: 0.25 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32" aria-label="How the market works">
      <div className="reveal mb-16 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--cyan)' }}>
          The mechanism
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-5xl" style={{ color: '#fff' }}>
          How the market re-prices on argument
        </h2>
      </div>

      <div ref={ref} className="relative">
        {/* vertical connector rail */}
        <div
          className="absolute bottom-6 left-[26px] top-6 hidden w-px sm:block"
          style={{ background: 'linear-gradient(180deg, rgba(34,211,238,0.4), rgba(52,245,197,0.1))' }}
          aria-hidden
        />
        <ol className="space-y-12 sm:space-y-16">
          {STEPS.map((s, i) => {
            const Icon = s.Icon;
            return (
              <li
                key={s.k}
                className="reveal relative grid grid-cols-1 gap-5 sm:grid-cols-[56px_1fr]"
                style={{ transitionDelay: `${i * 90}ms`, marginLeft: i === 1 ? undefined : 0 }}
              >
                <div className="relative flex sm:block">
                  <span
                    className="glass relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full"
                    style={{ borderColor: `${s.accent}55` }}
                  >
                    <Icon size={22} style={{ color: s.accent }} aria-hidden />
                  </span>
                </div>
                <div
                  className="glass p-6 sm:p-7"
                  style={{
                    maxWidth: i === 0 ? 560 : i === 1 ? 640 : 600,
                    marginLeft: i === 1 ? 'auto' : i === 2 ? '6%' : 0,
                  }}
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="tnum font-display text-2xl font-extrabold" style={{ color: s.accent }}>
                      {s.k}
                    </span>
                    <h3 className="font-display text-xl font-bold" style={{ color: '#fff' }}>
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed sm:text-base" style={{ color: 'var(--muted)' }}>
                    {s.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
