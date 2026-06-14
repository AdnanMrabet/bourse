'use client';

import { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyableProps {
  value: string;
  label?: string;
  className?: string;
}

// Click to copy with a transient "Copied" tooltip. Used for the full wallet
// address and the contract address.
export default function Copyable({ value, label, className }: CopyableProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard may be blocked; the address is still visible */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      className={`relative inline-flex items-center gap-2 font-mono text-xs ${className ?? ''}`}
      style={{ color: 'var(--ink)', minHeight: 0 }}
      aria-label={`Copy ${label ?? 'value'}`}
    >
      <span>{label ?? value}</span>
      {copied ? (
        <Check size={14} style={{ color: 'var(--up)' }} aria-hidden />
      ) : (
        <Copy size={14} style={{ color: 'var(--muted)' }} aria-hidden />
      )}
      <span
        role="status"
        className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md px-2 py-1 text-[10px] transition-opacity"
        style={{
          background: 'rgba(7,11,26,0.95)',
          border: '1px solid var(--line)',
          color: 'var(--up)',
          opacity: copied ? 1 : 0,
          whiteSpace: 'nowrap',
        }}
      >
        Copied
      </span>
    </button>
  );
}
