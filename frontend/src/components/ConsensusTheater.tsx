'use client';

import { Check, Loader2 } from 'lucide-react';
import { LeaderDraft } from '@/lib/contract';
import { TxPhase } from '@/hooks/useTransaction';
import { stanceStyle } from '@/lib/format';

interface ConsensusTheaterProps {
  phase: TxPhase;
  liveStatus: string;
  draft: LeaderDraft | null;
}

interface Stage {
  key: string;
  label: string;
  note: string;
}

const STAGES: Stage[] = [
  { key: 'wallet', label: 'Signing the order', note: 'Approve the pitch in your wallet' },
  { key: 'submitted', label: 'Order on the wire', note: 'The thesis is on chain, awaiting the Analyst' },
  { key: 'reading', label: 'The Analyst reads the case', note: 'Weighing the argument on its merits' },
  { key: 'consensus', label: 'Validators re-run the call', note: 'Independent rulings converge on a verdict' },
  { key: 'confirmed', label: 'The price re-prints', note: 'Consensus reached, the tape moves' },
];

// Maps the live transaction status onto the narrative stages. PROPOSING and the
// timeout statuses keep the consensus stage active rather than reading as an
// error, since the network simply rotates the leader and retries.
function stageIndex(phase: TxPhase, status: string): number {
  if (phase === 'confirmed') return 4;
  if (phase === 'wallet') return 0;
  if (phase === 'submitted') return 1;
  const s = status.toUpperCase();
  if (s === 'PENDING' || s === 'PROPOSING') return 2;
  if (
    s === 'COMMITTING' ||
    s === 'REVEALING' ||
    s === 'ACCEPTED' ||
    s === 'FINALIZED' ||
    s === 'LEADER_TIMEOUT' ||
    s === 'VALIDATORS_TIMEOUT'
  ) {
    return 3;
  }
  return 2;
}

export default function ConsensusTheater({ phase, liveStatus, draft }: ConsensusTheaterProps) {
  const active = stageIndex(phase, liveStatus);
  const timedOut = /LEADER_TIMEOUT|VALIDATORS_TIMEOUT/i.test(liveStatus);
  const stance = draft ? stanceStyle(draft.stance) : null;

  return (
    <div>
      <ol className="space-y-2.5">
        {STAGES.map((s, i) => {
          const done = i < active || phase === 'confirmed';
          const current = i === active && phase !== 'confirmed';
          return (
            <li
              key={s.key}
              className="glass-2 flex items-center gap-3 p-3"
              style={{
                borderColor: current ? 'rgba(34,211,238,0.4)' : 'var(--line)',
                opacity: i <= active || done ? 1 : 0.4,
              }}
            >
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  background: done ? 'rgba(52,245,197,0.16)' : 'rgba(34,211,238,0.1)',
                  border: `1px solid ${done ? 'var(--up)' : current ? 'var(--cyan)' : 'var(--line)'}`,
                }}
              >
                {done ? (
                  <Check size={14} style={{ color: 'var(--up)' }} aria-hidden />
                ) : current ? (
                  <Loader2 size={14} className="live-dot" style={{ color: 'var(--cyan)' }} aria-hidden />
                ) : (
                  <span className="tnum font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
                    {i + 1}
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold" style={{ color: current || done ? '#fff' : 'var(--muted)' }}>
                  {s.label}
                </p>
                <p className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
                  {s.note}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Leader peek: the Analyst's leaning call, not yet final */}
      {stance && phase !== 'confirmed' && (
        <div
          className="glass-2 mt-4 p-4 text-center"
          style={{ borderColor: `${stance.color}55` }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            The Analyst is leaning
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold" style={{ color: stance.color }}>
            {stance.label.toUpperCase()}
            {typeof draft?.magnitude === 'number' ? ` · ${draft.magnitude}` : ''}
          </p>
          <p className="mt-1 font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
            the Analyst&apos;s call, sealing under consensus
          </p>
        </div>
      )}

      {timedOut && phase !== 'confirmed' && (
        <p className="mt-4 text-center font-mono text-[11px]" style={{ color: 'var(--cyan)' }}>
          The lead Analyst timed out, so the network is rotating to another and re-running the call.
          This is normal, the order is still live.
        </p>
      )}

      {liveStatus && (
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          status: {liveStatus}
        </p>
      )}
    </div>
  );
}
