'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AssetSummary, fetchAssets, fetchStats, Stats } from '@/lib/contract';

const POLL_MS = 90_000;

export interface ContractData {
  assets: AssetSummary[];
  stats: Stats | null;
  loading: boolean;
  slow: boolean;
  error: string | null;
  diagnostic: boolean;
  refresh: () => Promise<void>;
  setBusy: (busy: boolean) => void;
}

interface Classified {
  message: string;
  diagnostic: boolean;
}

function classifyError(e: unknown): Classified {
  const msg = String(e);
  if (/contract not found|execution reverted|no contract|account .* not found|0x0{40}/i.test(msg)) {
    return {
      message: 'No Bourse contract is live at the configured address on Bradbury yet.',
      diagnostic: true,
    };
  }
  if (/rate limit|429|too many/i.test(msg)) {
    return { message: 'The feed is being rate limited. Retrying shortly.', diagnostic: false };
  }
  return {
    message: 'Could not reach the market. Check your connection and retry.',
    diagnostic: false,
  };
}

export function useContractData(): ContractData {
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState(false);

  const alive = useRef(true);
  const busy = useRef(false);

  const load = useCallback(async () => {
    const slowTimer = setTimeout(() => {
      if (alive.current) setSlow(true);
    }, 5000);
    try {
      const [a, st] = await Promise.all([fetchAssets(0), fetchStats()]);
      if (!alive.current) return;
      setAssets(a);
      setStats(st);
      setError(null);
      setDiagnostic(false);
    } catch (e) {
      if (!alive.current) return;
      const c = classifyError(e);
      setError(c.message);
      setDiagnostic(c.diagnostic);
    } finally {
      clearTimeout(slowTimer);
      if (alive.current) {
        setLoading(false);
        setSlow(false);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading((prev) => prev || assets.length === 0);
    await load();
  }, [load, assets.length]);

  const setBusy = useCallback((b: boolean) => {
    busy.current = b;
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const id = setInterval(() => {
      if (busy.current) return; // pause polling entirely while a tx is in flight
      load();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load]);

  return { assets, stats, loading, slow, error, diagnostic, refresh, setBusy };
}
