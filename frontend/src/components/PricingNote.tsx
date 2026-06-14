'use client';

import { ListPlus, MessagesSquare, ScanLine } from 'lucide-react';

interface PricingNoteProps {
  onList: () => void;
}

const LINES: { Icon: typeof ListPlus; accent: string; label: string; body: string }[] = [
  {
    Icon: ListPlus,
    accent: 'var(--cyan)',
    label: 'List',
    body: 'Any idea opens as a tradable asset at a flat one hundred. No deposit, no custody.',
  },
  {
    Icon: MessagesSquare,
    accent: 'var(--up)',
    label: 'Pitch',
    body: 'You argue instead of buy. A bull or bear thesis is the order; the reasoning is the size.',
  },
  {
    Icon: ScanLine,
    accent: 'var(--cyan)',
    label: 'Rule',
    body: 'An on-chain AI Analyst weighs the case and validators must agree before the price re-prices.',
  },
];

// A short prospectus woven beside the tape, not a full-width step row. It states
// the pricing mechanism in a few tight lines so the split reads as floor plus
// rulebook side by side.
export default function PricingNote({ onList }: PricingNoteProps) {
  return (
    <div className="glass flex h-full flex-col p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>
        Prospectus
      </p>
      <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl" style={{ color: '#fff' }}>
        How pricing works
      </h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        Bourse prices ideas on the strength of the argument, never on the size of a wallet.
      </p>

      <ol className="mt-5 flex-1 space-y-3.5">
        {LINES.map((l) => {
          const Icon = l.Icon;
          return (
            <li key={l.label} className="flex items-start gap-3">
              <span
                className="glass-2 mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                style={{ borderColor: `${l.accent}55` }}
              >
                <Icon size={16} style={{ color: l.accent }} aria-hidden />
              </span>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
                <span className="font-display font-bold" style={{ color: '#fff' }}>
                  {l.label}.
                </span>{' '}
                {l.body}
              </p>
            </li>
          );
        })}
      </ol>

      <button type="button" className="btn btn-ghost mt-6 w-full" onClick={onList}>
        List or pitch an idea
      </button>
    </div>
  );
}
