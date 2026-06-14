# BOURSE

An exchange where you trade with arguments instead of money. List an idea, and its price moves only when someone makes a case the AI finds convincing. Built on GenLayer.

## What trades here

Ideas. Anyone lists one as an asset; it opens at 100.0 and from then on its price is set by debate, not by capital. You do not buy or sell. You submit a thesis, bull or bear, and an AI Analyst decides whether the argument, on its merits, should push the price up, down, or barely at all, and how hard. A rigorous, specific case moves the market. Hype moves almost nothing.

## The mechanism

Every pitch is one call to the Analyst, which returns a stance and a magnitude:

- BULLISH lifts the price, BEARISH drops it, NEUTRAL leaves it about where it was.
- Magnitude, 0 to 20, scales the move. Each point shifts the price by roughly seven tenths of a percent.

The price walks a path over time, and every asset keeps its full history as a chart, so a market of ideas re-prices itself continuously on the strength of what people argue.

## Why this is a GenLayer contract

Weighing whether an argument is convincing is a judgement only a language model can make, and a model's exact words differ run to run, which a blockchain cannot agree on. Bourse settles only what must be settled:

- The Analyst returns a STANCE and a MAGNITUDE. Validators independently re-run the call and must agree on the stance exactly and the magnitude within a tolerance. The written note is commentary and is never compared.
- The price move is pure deterministic code: stance and magnitude become a signed, clamped delta appended to the asset's history. Every validator records the identical price.

The agreement rule is a custom validator passed to `gl.vm.run_nondet_unsafe`, never `strict_eq`.

## API surface

- `list_asset(name)` opens a new idea at the starting price (deterministic).
- `pitch(asset_id, thesis)` is the consensus trade: the Analyst rules and the price moves.
- `get_assets(start)`, `get_asset(id)`, `get_history(asset_id, start)`, `get_stats()` read the board, an asset with its history, the pitch log, and the totals.

No server, no order book, no custody. Prices and histories are contract state; you only pay network fees.

## The terminal

A scrolling page styled as a neon web3 trading floor: the header collapses into a live price ticker as you scroll, the hero floats on parallax depth planes, assets are layered glass cards with sparklines, and the footer is a stack of translucent panels with depth. Built with Next.js (static export), framer-motion, genlayer-js, and hand-drawn SVG; type in Orbitron, Chakra Petch, and Share Tech Mono. No images.

## Board

**Live board:** https://adnanmrabet.github.io/bourse/
**Contract:** `0xf0a3AEFe06CfA344cA5c759387FF8817879CD0F9`
**Explorer:** https://explorer-bradbury.genlayer.com/address/0xf0a3AEFe06CfA344cA5c759387FF8817879CD0F9
**Listing tx:** `0x6e4183dce15cce82d867db2e21f7ce4f1555fd284dc55c282c86270ea2da1b4f`
**Faucet:** https://testnet-faucet.genlayer.foundation/

## Local run

```bash
genvm-lint lint contracts/contract.py
gltest tests/integration/ -v -s --network studionet
cd frontend && npm install && npm run dev
```

A browser wallet on GenLayer Bradbury Testnet and a little faucet GEN cover the fees. List an idea and let the floor argue over what it is worth.
