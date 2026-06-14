'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, MessageSquarePlus, ExternalLink } from 'lucide-react';
import { WalletState } from '@/hooks/useWallet';
import { useTransaction } from '@/hooks/useTransaction';
import { AssetSummary, AssetRecord, fetchAsset, pitch, EXPLORER } from '@/lib/contract';
import { formatPrice, percentMove, formatPercent, direction, moveColor, formatSignedPoints, stanceStyle } from '@/lib/format';
import ConsensusTheater from './ConsensusTheater';
import PriceChart from './PriceChart';
import { useToast } from './Toast';

interface PitchModalProps {
  open: boolean;
  asset: AssetSummary | null;
  wallet: WalletState;
  onClose: () => void;
  onConfirmed: () => void;
  setBusy: (b: boolean) => void;
}

const MIN = 10;
const MAX = 300;

// Pitch a bull or bear thesis. The AI consensus write runs a staged theater
// while validators rule; on acceptance the asset is re-read and the price ticks.
export default function PitchModal({ open, asset, wallet, onClose, onConfirmed, setBusy }: PitchModalProps) {
  const [thesis, setThesis] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'run'>('form');
  const [result, setResult] = useState<AssetRecord | null>(null);
  const { state, run, reset } = useTransaction();
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setThesis('');
      setStep('form');
      setResult(null);
      reset();
    }
  }, [open, reset]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && (step === 'form' || step === 'confirm')) onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, step]);

  const loadResult = useCallback(async (id: string) => {
    try {
      const rec = await fetchAsset(id);
      setResult(rec);
    } catch {
      /* the floor refresh will still pick up the new print */
    }
  }, []);

  if (!open || !asset) return null;

  const trimmed = thesis.trim();
  const valid = trimmed.length >= MIN && trimmed.length <= MAX;
  const busy = step === 'run' && state.phase !== 'confirmed' && state.phase !== 'error';

  const submit = () => {
    if (!wallet.address || !valid) return;
    setStep('run');
    run({
      account: wallet.address,
      send: (c) => pitch(c, asset.id, trimmed),
      onBusy: setBusy,
      onConfirmed: (_status, draft) => {
        loadResult(asset.id);
        const st = draft ? stanceStyle(draft.stance).label.toLowerCase() : 'its';
        toast.push('success', `The Analyst ruled ${st} on ${asset.name}. The price re-printed.`);
        onConfirmed();
      },
    });
  };

  const close = () => {
    if (busy) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`Pitch a thesis on ${asset.name}`}>
      <div className="absolute inset-0" style={{ background: 'rgba(3,6,16,0.78)', backdropFilter: 'blur(6px)' }} onClick={close} />
      <div className="glass rise relative z-10 flex max-h-[92svh] w-full flex-col overflow-y-auto p-6 sm:max-w-lg sm:rounded-2xl" style={{ borderColor: 'rgba(34,211,238,0.28)' }}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Pitch a thesis
            </p>
            <h2 className="font-display text-lg font-bold" style={{ color: '#fff' }}>
              {asset.name}
            </h2>
          </div>
          <button type="button" onClick={close} aria-label="Close" disabled={busy} style={{ color: 'var(--muted)', flexShrink: 0 }}>
            <X size={20} aria-hidden />
          </button>
        </div>

        {step === 'run' ? (
          state.phase === 'confirmed' ? (
            <Outcome asset={asset} result={result} hash={state.hash} stance={state.draft?.stance} onClose={onClose} />
          ) : state.phase === 'error' ? (
            <div className="py-6 text-center">
              <p className="text-sm" style={{ color: 'var(--down)' }}>{state.error}</p>
              <button type="button" className="btn btn-ghost mt-6 w-full" onClick={onClose}>Close</button>
            </div>
          ) : (
            <ConsensusTheater phase={state.phase} liveStatus={state.liveStatus} draft={state.draft} />
          )
        ) : step === 'form' ? (
          <>
            <div className="glass-2 mb-4 flex items-center justify-between p-3">
              <span className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>current</span>
              <span className="tnum font-display text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatPrice(asset.price)}</span>
            </div>
            <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
              Make your case. The Analyst weighs the thesis on its merits alone and rules bullish,
              bearish, or neutral. A rigorous, specific argument moves the price more than hype.
            </p>
            <label htmlFor="thesis" className="mb-2 block font-mono text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Your thesis
            </label>
            <textarea
              id="thesis"
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="Falling energy cost compounds into cheaper water, food, and compute, lifting everything at once."
              rows={5}
              maxLength={MAX + 40}
              className="w-full resize-none px-3.5 py-3 text-base"
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
              <span style={{ color: !valid && trimmed.length > 0 ? 'var(--down)' : 'var(--muted)' }}>
                {trimmed.length < MIN ? `At least ${MIN} characters` : trimmed.length > MAX ? `At most ${MAX} characters` : 'Ready to submit'}
              </span>
              <span className="tnum" style={{ color: trimmed.length > MAX ? 'var(--down)' : 'var(--muted)' }}>
                {trimmed.length}/{MAX}
              </span>
            </div>

            {!wallet.address ? (
              <button type="button" className="btn btn-primary mt-6 w-full" onClick={wallet.connect}>
                Connect a wallet to pitch
              </button>
            ) : !wallet.onChain ? (
              <p className="mt-6 text-center text-sm" style={{ color: 'var(--down)' }}>
                Switch your wallet to Bradbury Testnet to pitch a thesis.
              </p>
            ) : (
              <button type="button" className="btn btn-primary mt-6 w-full" disabled={!valid} onClick={() => setStep('confirm')}>
                <MessageSquarePlus size={16} aria-hidden />
                Review and pitch
              </button>
            )}
          </>
        ) : (
          <div>
            <div className="glass-2 mb-4 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>your thesis</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--ink)' }}>{trimmed}</p>
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              This submits a transaction on Bradbury Testnet. Network fees apply. The AI ruling can
              take one to five minutes under consensus. Continue?
            </p>
            {state.error && <p className="mt-3 text-sm" style={{ color: 'var(--down)' }}>{state.error}</p>}
            <div className="mt-6 flex gap-3">
              <button type="button" className="btn btn-ghost flex-1" onClick={() => setStep('form')}>Back</button>
              <button type="button" className="btn btn-primary flex-1" onClick={submit}>Continue</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Outcome({
  asset,
  result,
  hash,
  stance,
  onClose,
}: {
  asset: AssetSummary;
  result: AssetRecord | null;
  hash: `0x${string}` | null;
  stance?: string;
  onClose: () => void;
}) {
  const newPrice = result ? result.price : asset.price;
  const open = result ? result.open_price : asset.open_price;
  const delta = newPrice - asset.price;
  const pct = percentMove(newPrice, open);
  const dir = direction(delta);
  const c = moveColor(dir);
  const ss = stanceStyle(result?.history?.[result.history.length - 1]?.stance ?? stance ?? 'NEUTRAL');
  const prices = result ? result.history.map((h) => h.price) : asset.spark;

  return (
    <div className="rise">
      <div className="glass-2 mb-4 p-4 text-center" style={{ borderColor: `${ss.color}55` }}>
        <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          The Analyst ruled
        </p>
        <p className="mt-1 font-display text-3xl font-extrabold" style={{ color: ss.color }}>
          {ss.label.toUpperCase()}
        </p>
      </div>

      <div className="mb-4 flex items-end justify-center gap-3">
        <span className="tnum font-display text-4xl font-extrabold" style={{ color: 'var(--ink)' }}>
          {formatPrice(newPrice)}
        </span>
        <span className="tnum mb-1.5 font-mono text-sm" style={{ color: c }}>
          {formatSignedPoints(delta)} ({formatPercent(pct)})
        </span>
      </div>

      <div className="glass-2 mb-4 p-3">
        <PriceChart prices={prices} height={170} highlightLast />
      </div>

      {hash && (
        <a href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center justify-center gap-1.5 font-mono text-[11px]" style={{ color: 'var(--cyan)' }}>
          <ExternalLink size={13} aria-hidden />
          View transaction
        </a>
      )}

      <button type="button" className="btn btn-primary w-full" onClick={onClose}>
        Back to the floor
      </button>
    </div>
  );
}
