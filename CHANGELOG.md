# Changelog

## v0.5.0

- Added `TollgateReceipt.sol`, a minimal contract deployed on Arc Testnet
  that logs an on-chain event per paid query (payer, amount, question
  hash, timestamp). No escrow yet, logging only, that's next.
- Started migrating payments onto Arc App Kit (`@circle-fin/app-kit`)
  instead of a hand-rolled ethers.js transfer, see `src/lib/appkit.ts`.
  The manual path in `src/lib/arc.ts` stays as a fallback until the
  migration is fully tested.
- Hardhat added for contract compilation/deployment (`npm run compile`,
  `npm run deploy:testnet`)
- Docs tab updated with the App Kit snippet and a note on the receipt contract

## v0.4.0

- New API tab: prepaid USDC credits + an API key per wallet
- New `/api/v1/query` endpoint for calling Tollgate programmatically
  (Bearer token auth, debits prepaid balance instead of requiring a
  wallet signature per call)
- Docs tab updated to point developers at the API flow
- Split credit/balance logic into its own lib module instead of living
  inside a route file

## v0.3.1

- Fixed a stale closure in the account-change listener: switching wallets
  quickly could occasionally miss firing disconnect. Pulled the handler
  out into a stable `useCallback` so it always sees the latest state.
- Renamed a few internal constants for clarity (`QUERY_FEE`, `TREASURY_ADDR`)
- Removed dead code left over from an earlier ERC-20 transfer approach
  (unused ABI constants, unused contract address env var path)

## v0.3.0

- Wallet dropdown: copy address, view on explorer, disconnect
- Wallet account switching handled automatically
- Wrong-network banner with one-click switch back to Arc Testnet
- Live network status pill (pings Arc RPC, shows latest block height)
- Favicon, Open Graph and Twitter card metadata + social share image
- Landing page rebuilt as an actual product page: app preview mockup,
  live stats pulled from /api/stats, GitHub/Docs links in nav
- Removed remaining glow effects for a cleaner look

## v0.2.0

- Server-side on-chain payment verification via eth_getTransactionByHash
  (checks recipient, amount, and confirmation before serving inference)
- Verified on-chain badge and inference latency badge on answers
- New tabs: Network (live cross-user stats), History (per-wallet), Docs (integration guide)
- /api/stats endpoint tracking totals, leaderboard, and recent activity

## v0.1.0

- Initial release: landing page, wallet connect with auto network add,
  native USDC payment on Arc Testnet, Claude-powered answers,
  session payment ledger, architecture diagram, demo mode
