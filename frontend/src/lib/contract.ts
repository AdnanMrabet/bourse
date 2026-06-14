import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

// Placeholder address until the Bourse contract is deployed to Bradbury.
// The reads will surface a precise diagnostic until this is filled in.
export const CONTRACT_ADDRESS =
  '0xf0a3AEFe06CfA344cA5c759387FF8817879CD0F9' as const;
export const DEPLOY_TX =
  '0x6e4183dce15cce82d867db2e21f7ce4f1555fd284dc55c282c86270ea2da1b4f' as const;
export const EXPLORER = 'https://explorer-bradbury.genlayer.com';
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/';
export const DOCS = 'https://docs.genlayer.com';

export const readClient = createClient({ chain: testnetBradbury });

export const makeWalletClient = (account: `0x${string}`) =>
  createClient({ chain: testnetBradbury, account });

export type WalletClient = ReturnType<typeof makeWalletClient>;

const ADDRESS = CONTRACT_ADDRESS as `0x${string}`;

// ---- shapes returned by the contract views -----------------------------

export type Stance = 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'OPEN' | string;

export interface AssetSummary {
  id: string;
  name: string;
  price: number;
  open_price: number;
  pitches: number;
  spark: number[];
}

export interface HistoryEntry {
  n: number;
  actor: string;
  stance: Stance;
  magnitude: number;
  delta: number;
  price: number;
  note: string;
  snippet: string;
}

export interface AssetRecord {
  id: string;
  lister: string;
  name: string;
  price: number;
  open_price: number;
  pitches: number;
  history: HistoryEntry[];
}

export interface Stats {
  assets: number;
  pitches: number;
}

// ---- resilient reads ----------------------------------------------------

export async function withRpcRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!/rate limit|429|timeout|network|fetch|too many/i.test(String(e))) throw e;
      // backoff: 2.5s, 5s, 10s, 20s
      await new Promise((r) => setTimeout(r, 2500 * 2 ** i));
    }
  }
  throw last;
}

function toRecord<T>(value: unknown): T {
  if (value instanceof Map) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of value.entries()) obj[String(k)] = normalize(v);
    return obj as T;
  }
  return value as T;
}

function normalize(value: unknown): unknown {
  if (value instanceof Map) return toRecord(value);
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'bigint') return value.toString();
  return value;
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  const n = Number(String(v ?? '0'));
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return String(v ?? '');
}

function asAssetSummary(raw: unknown): AssetSummary {
  const r = toRecord<Record<string, unknown>>(raw);
  const spark = Array.isArray(r.spark) ? (r.spark as unknown[]).map(num) : [];
  return {
    id: str(r.id),
    name: str(r.name),
    price: num(r.price),
    open_price: num(r.open_price),
    pitches: num(r.pitches),
    spark,
  };
}

function asHistoryEntry(raw: unknown): HistoryEntry {
  const r = toRecord<Record<string, unknown>>(raw);
  return {
    n: num(r.n),
    actor: str(r.actor),
    stance: str(r.stance) || 'NEUTRAL',
    magnitude: num(r.magnitude),
    delta: num(r.delta),
    price: num(r.price),
    note: str(r.note),
    snippet: str(r.snippet),
  };
}

function asAssetRecord(raw: unknown): AssetRecord {
  const r = toRecord<Record<string, unknown>>(raw);
  const history = Array.isArray(r.history) ? (r.history as unknown[]).map(asHistoryEntry) : [];
  return {
    id: str(r.id),
    lister: str(r.lister),
    name: str(r.name),
    price: num(r.price),
    open_price: num(r.open_price),
    pitches: num(r.pitches),
    history,
  };
}

export async function fetchAssets(start = 0): Promise<AssetSummary[]> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_assets', args: [start] }),
  );
  const arr = (normalize(raw) as unknown[]) ?? [];
  return arr.map(asAssetSummary);
}

export async function fetchAsset(id: string): Promise<AssetRecord> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_asset', args: [id] }),
  );
  return asAssetRecord(normalize(raw));
}

export async function fetchHistory(id: string, start = 0): Promise<HistoryEntry[]> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_history', args: [id, start] }),
  );
  const arr = (normalize(raw) as unknown[]) ?? [];
  return arr.map(asHistoryEntry);
}

export async function fetchStats(): Promise<Stats> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_stats', args: [] }),
  );
  const r = toRecord<Record<string, unknown>>(normalize(raw));
  return { assets: num(r.assets), pitches: num(r.pitches) };
}

// ---- writes -------------------------------------------------------------

export function listAsset(client: WalletClient, name: string) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'list_asset',
    args: [name],
    value: 0n,
  });
}

export function pitch(client: WalletClient, assetId: string, thesis: string) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'pitch',
    args: [assetId, thesis],
    value: 0n,
  });
}

// ---- transaction polling ------------------------------------------------

const STATUS_NAME: Record<string, string> = {
  '1': 'PENDING',
  '2': 'PROPOSING',
  '3': 'COMMITTING',
  '4': 'REVEALING',
  '5': 'ACCEPTED',
  '6': 'UNDETERMINED',
  '7': 'FINALIZED',
  '8': 'CANCELED',
  '12': 'VALIDATORS_TIMEOUT',
  '13': 'LEADER_TIMEOUT',
};

export const statusName = (s: unknown): string =>
  STATUS_NAME[String(s)] ?? String(s ?? 'PENDING').toUpperCase();

// LEADER_TIMEOUT / VALIDATORS_TIMEOUT are intentionally absent: the network
// rotates the leader and retries, so keep polling through them.
const TERMINAL = new Set(['ACCEPTED', 'FINALIZED', 'UNDETERMINED', 'CANCELED']);

export interface LeaderDraft {
  stance: string;
  magnitude?: number;
  note?: string;
}

function pick(obj: unknown, key: string): unknown {
  if (obj instanceof Map) return obj.get(key);
  if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[key];
  return undefined;
}

// Peek at the Analyst's sealed draft from the leader receipt's base64
// eq_outputs. This is the leaning call before validators finalize consensus.
export function extractLeaderDraft(tx: unknown): LeaderDraft | null {
  try {
    const receipts = pick(pick(tx, 'consensus_data'), 'leader_receipt');
    const first = Array.isArray(receipts) ? receipts[0] : receipts;
    const b64 = pick(pick(first, 'eq_outputs'), '0');
    if (typeof b64 !== 'string' || b64.length === 0) return null;
    const text = atob(b64);
    for (let i = text.length - 1; i >= 0; i--) {
      if (text[i] !== '{') continue;
      try {
        const obj = JSON.parse(text.slice(i));
        if (obj && typeof obj === 'object' && 'stance' in obj) {
          return {
            stance: String((obj as Record<string, unknown>).stance ?? ''),
            magnitude: num((obj as Record<string, unknown>).magnitude),
            note: str((obj as Record<string, unknown>).note),
          };
        }
      } catch {
        /* keep scanning toward the start for a parseable object */
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function pollUntilDecided(
  client: WalletClient,
  hash: `0x${string}`,
  onUpdate?: (status: string, draft: LeaderDraft | null) => void,
): Promise<{ status: string; draft: LeaderDraft | null }> {
  let draft: LeaderDraft | null = null;
  for (let i = 0; i < 150; i++) {
    const tx = await client
      .getTransaction({ hash } as Parameters<typeof client.getTransaction>[0])
      .catch(() => null);
    const status = statusName(tx ? (tx as { status?: unknown }).status : 'PENDING');
    draft = extractLeaderDraft(tx) ?? draft;
    onUpdate?.(status, draft);
    if (TERMINAL.has(status)) return { status, draft };
    await new Promise((r) => setTimeout(r, 8000));
  }
  return { status: 'TIMEOUT', draft };
}
