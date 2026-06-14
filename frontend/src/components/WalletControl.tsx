'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Wallet } from 'lucide-react';
import { WalletState } from '@/hooks/useWallet';
import { shortAddress } from '@/lib/format';
import { EXPLORER } from '@/lib/contract';
import Copyable from './Copyable';

interface WalletControlProps {
  wallet: WalletState;
  compact?: boolean;
}

// Docked at the ticker's right edge. Connect to open; once connected it becomes
// a dropdown with the full address, copy, balance, network state, and exit.
export default function WalletControl({ wallet, compact }: WalletControlProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!wallet.address) {
    return (
      <button
        type="button"
        className="btn btn-primary"
        onClick={wallet.connect}
        disabled={wallet.connecting}
        style={compact ? { minHeight: 38, padding: '0 14px', fontSize: 13 } : undefined}
      >
        <Wallet size={16} aria-hidden />
        {wallet.connecting ? 'Connecting' : 'Connect'}
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={compact ? { minHeight: 38, padding: '0 12px', fontSize: 13 } : undefined}
      >
        <span
          className="dot"
          style={{ background: wallet.onChain ? 'var(--up)' : 'var(--down)' }}
          aria-hidden
        />
        <span className="font-mono">{shortAddress(wallet.address)}</span>
        <ChevronDown size={15} aria-hidden style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div
          role="menu"
          className="glass rise absolute right-0 z-[130] mt-2 w-[280px] p-4"
          style={{ borderColor: 'rgba(34,211,238,0.28)' }}
        >
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Trader address
          </p>
          <div className="mb-3 break-all rounded-lg p-2 font-mono text-xs" style={{ background: 'rgba(7,11,26,0.7)', color: 'var(--ink)' }}>
            <Copyable value={wallet.address} label={wallet.address} />
          </div>

          <div className="mb-2 flex items-center justify-between text-xs">
            <span style={{ color: 'var(--muted)' }}>Balance</span>
            <span className="tnum" style={{ color: 'var(--ink)' }}>
              {wallet.balance ?? '0'} GEN
            </span>
          </div>
          <div className="mb-3 flex items-center justify-between text-xs">
            <span style={{ color: 'var(--muted)' }}>Network</span>
            <span style={{ color: wallet.onChain ? 'var(--up)' : 'var(--down)' }}>
              {wallet.onChain ? 'Bradbury Testnet' : 'Wrong network'}
            </span>
          </div>

          {!wallet.onChain && (
            <p className="mb-3 text-[11px]" style={{ color: 'var(--down)' }}>
              Switch your wallet to GenLayer Bradbury to trade on the floor.
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <a
              href={`${EXPLORER}/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px]"
              style={{ color: 'var(--cyan)' }}
            >
              View on explorer
            </a>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 font-mono text-[11px]"
              onClick={() => {
                wallet.disconnect();
                setOpen(false);
              }}
              style={{ color: 'var(--down)', minHeight: 0 }}
            >
              <LogOut size={13} aria-hidden />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
