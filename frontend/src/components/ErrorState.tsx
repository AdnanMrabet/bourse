'use client';

import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER } from '@/lib/contract';

interface ErrorStateProps {
  message: string;
  diagnostic?: boolean;
  onRetry: () => void;
}

// Styled failure card. The chrome around it still renders; a contract-not-found
// or reverted read shows a precise diagnostic with a link to the explorer.
export default function ErrorState({ message, diagnostic, onRetry }: ErrorStateProps) {
  return (
    <div className="glass mx-auto max-w-xl p-8 text-center" role="alert">
      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ border: '1px solid rgba(255,84,112,0.4)', background: 'rgba(255,84,112,0.08)' }}
      >
        <AlertTriangle size={24} style={{ color: 'var(--down)' }} aria-hidden />
      </div>
      <h3 className="font-display text-xl font-bold" style={{ color: '#fff' }}>
        {diagnostic ? 'The trading desk is offline' : 'Could not reach the market'}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
        {message}
      </p>

      {diagnostic && (
        <div className="mt-5 rounded-lg p-3 text-left font-mono text-[11px]" style={{ background: 'rgba(7,11,26,0.7)', color: 'var(--muted)' }}>
          <p>address: {CONTRACT_ADDRESS}</p>
          <p className="mt-1">network: GenLayer Bradbury Testnet (4221)</p>
        </div>
      )}

      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden />
          Retry
        </button>
        <a
          href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
        >
          <ExternalLink size={16} aria-hidden />
          Open explorer
        </a>
      </div>
    </div>
  );
}
