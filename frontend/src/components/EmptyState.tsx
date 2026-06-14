'use client';

import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onList: () => void;
}

// Bourse-specific empty floor. The tape is blank because no idea has been
// listed yet; the first listing opens the market.
export default function EmptyState({ onList }: EmptyStateProps) {
  return (
    <div className="glass mx-auto max-w-xl p-9 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ border: '1px solid rgba(34,211,238,0.4)', background: 'rgba(34,211,238,0.08)' }}>
        <Sparkles size={24} style={{ color: 'var(--cyan)' }} aria-hidden />
      </div>
      <h3 className="font-display text-2xl font-bold" style={{ color: '#fff' }}>
        The floor is open and the tape is blank
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
        No idea has been listed yet. Be the first to put a conviction on the board. Name an idea, it
        opens at one hundred, and the first thesis sets it moving.
      </p>
      <button type="button" className="btn btn-primary mt-7" onClick={onList}>
        <Sparkles size={16} aria-hidden />
        List the first idea
      </button>
    </div>
  );
}
