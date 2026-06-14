'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, Check, Loader2, ExternalLink } from 'lucide-react';
import { WalletState } from '@/hooks/useWallet';
import { useTransaction } from '@/hooks/useTransaction';
import { listAsset, EXPLORER } from '@/lib/contract';
import { useToast } from './Toast';

interface ListModalProps {
  open: boolean;
  wallet: WalletState;
  onClose: () => void;
  onConfirmed: () => void;
  setBusy: (b: boolean) => void;
}

const MIN = 3;
const MAX = 80;

// List a new idea as a tradable asset. Deterministic write: name validation, a
// transaction confirm dialog, then a brief on-chain settle.
export default function ListModal({ open, wallet, onClose, onConfirmed, setBusy }: ListModalProps) {
  const [name, setName] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const { state, run, reset } = useTransaction();
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setName('');
      setStep('form');
      reset();
    }
  }, [open, reset]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && state.phase === 'idle') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, state.phase]);

  if (!open) return null;

  const trimmed = name.trim();
  const valid = trimmed.length >= MIN && trimmed.length <= MAX;
  const busy = state.phase !== 'idle' && state.phase !== 'error' && state.phase !== 'confirmed';

  const submit = () => {
    if (!wallet.address || !valid) return;
    run({
      account: wallet.address,
      send: (c) => listAsset(c, trimmed),
      onBusy: setBusy,
      onConfirmed: () => {
        toast.push('success', `"${trimmed}" is live on the board, opening at 100.0.`);
        onConfirmed();
      },
    });
  };

  const close = () => {
    if (busy) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="List an idea">
      <div className="absolute inset-0" style={{ background: 'rgba(3,6,16,0.78)', backdropFilter: 'blur(6px)' }} onClick={close} />
      <div className="glass rise relative z-10 flex max-h-[92svh] w-full flex-col overflow-y-auto p-6 sm:max-w-lg sm:rounded-2xl" style={{ borderColor: 'rgba(34,211,238,0.28)' }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold" style={{ color: '#fff' }}>
            List an idea
          </h2>
          <button type="button" onClick={close} aria-label="Close" disabled={busy} style={{ color: 'var(--muted)' }}>
            <X size={20} aria-hidden />
          </button>
        </div>

        {state.phase === 'confirmed' ? (
          <Done name={trimmed} hash={state.hash} onClose={onClose} />
        ) : busy ? (
          <Running />
        ) : step === 'form' ? (
          <>
            <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
              Name the idea you want to put on the board. It opens at a flat 100.0 and the first
              thesis sets it moving.
            </p>
            <label htmlFor="asset-name" className="mb-2 block font-mono text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Idea name
            </label>
            <input
              id="asset-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cheap abundant energy"
              maxLength={MAX + 20}
              className="w-full px-3.5 py-3 text-base"
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
              <span style={{ color: !valid && trimmed.length > 0 ? 'var(--down)' : 'var(--muted)' }}>
                {trimmed.length < MIN ? `At least ${MIN} characters` : trimmed.length > MAX ? `At most ${MAX} characters` : 'Looks good'}
              </span>
              <span className="tnum" style={{ color: trimmed.length > MAX ? 'var(--down)' : 'var(--muted)' }}>
                {trimmed.length}/{MAX}
              </span>
            </div>

            {!wallet.address ? (
              <button type="button" className="btn btn-primary mt-6 w-full" onClick={wallet.connect}>
                Connect a wallet to list
              </button>
            ) : !wallet.onChain ? (
              <p className="mt-6 text-center text-sm" style={{ color: 'var(--down)' }}>
                Switch your wallet to Bradbury Testnet to list an idea.
              </p>
            ) : (
              <button type="button" className="btn btn-primary mt-6 w-full" disabled={!valid} onClick={() => setStep('confirm')}>
                <Sparkles size={16} aria-hidden />
                Review and list
              </button>
            )}
          </>
        ) : (
          <Confirm name={trimmed} error={state.error} onBack={() => { reset(); setStep('form'); }} onConfirm={submit} />
        )}
      </div>
    </div>
  );
}

function Confirm({ name, error, onBack, onConfirm }: { name: string; error: string | null; onBack: () => void; onConfirm: () => void }) {
  return (
    <div>
      <div className="glass-2 mb-4 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          New listing
        </p>
        <p className="mt-1 font-display text-lg font-bold" style={{ color: '#fff' }}>
          {name}
        </p>
        <p className="tnum mt-1 font-mono text-sm" style={{ color: 'var(--cyan)' }}>
          opens at 100.0
        </p>
      </div>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        This submits a transaction on Bradbury Testnet. Network fees apply. Continue?
      </p>
      {error && <p className="mt-3 text-sm" style={{ color: 'var(--down)' }}>{error}</p>}
      <div className="mt-6 flex gap-3">
        <button type="button" className="btn btn-ghost flex-1" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary flex-1" onClick={onConfirm}>
          Continue
        </button>
      </div>
    </div>
  );
}

function Running() {
  return (
    <div className="py-8 text-center">
      <Loader2 size={34} className="live-dot mx-auto" style={{ color: 'var(--cyan)' }} aria-hidden />
      <p className="mt-4 font-display text-sm font-semibold" style={{ color: '#fff' }}>
        Opening the market
      </p>
      <p className="mt-1 font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
        Settling the listing on chain
      </p>
    </div>
  );
}

function Done({ name, hash, onClose }: { name: string; hash: `0x${string}` | null; onClose: () => void }) {
  return (
    <div className="py-4 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ border: '1px solid var(--up)', background: 'rgba(52,245,197,0.1)' }}>
        <Check size={26} style={{ color: 'var(--up)' }} aria-hidden />
      </div>
      <h3 className="font-display text-lg font-bold" style={{ color: '#fff' }}>
        {name} is on the board
      </h3>
      <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
        It opened at 100.0. Pitch a thesis to set it moving.
      </p>
      {hash && (
        <a href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px]" style={{ color: 'var(--cyan)' }}>
          <ExternalLink size={13} aria-hidden />
          View transaction
        </a>
      )}
      <button type="button" className="btn btn-primary mt-6 w-full" onClick={onClose}>
        Back to the floor
      </button>
    </div>
  );
}
