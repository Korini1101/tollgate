# Tollgate

pay-per-inference AI on [Arc](https://arc.network). send 0.01 USDC, get an answer. the payment gets checked on-chain before the model even runs, not just trusted client-side.

built for the Ignyte Stablecoin Commerce Stack hackathon, Track 4 (Agentic Economy).

**demo:** https://tollgate.vercel.app *(swap for your deploy url)*

---

## the idea

most "AI + crypto" demos just slap a wallet connect button on a chatbot. I wanted the payment to actually mean something, so the backend doesn't trust the frontend's word that a payment happened. it goes and checks.

flow:

1. connect a wallet, Tollgate adds Arc Testnet for you if it's not already there
2. ask something, pay 0.01 USDC. on Arc this is just a normal transfer since USDC is the gas token, no approve() dance
3. server hits Arc's RPC directly (`eth_getTransactionByHash`), confirms the tx is mined, checks it went to the right address, checks the amount. any of that fails, you get a 402 and no answer
4. only past that point does the query actually hit the model. you get the answer plus a "verified on-chain" badge, the block number, and how long inference took

there's a demo toggle for people without a wallet installed, it's clearly marked as unverified so it doesn't get mistaken for the real flow.

## tabs

- **Agent** — the main query + pay screen
- **Network** — live numbers across everyone using this instance right now. total queries, USDC processed, who's paid the most, recent activity
- **History** — your own past queries, tied to your wallet
- **API** — prepaid credits + an API key, for calling Tollgate from your own code instead of a browser
- **Docs** — the pay-then-verify pattern as three code blocks, if you want to steal it for your own endpoint

## for developers: API + prepaid credits

signing a transaction for every single query is fine in a browser, annoying from a script. so there's a second way in:

1. connect your wallet once, go to the **API** tab
2. top up a prepaid balance (still a real on-chain USDC payment, just credited to a balance instead of spent per-call)
3. you get an API key (`tg_...`)
4. call `/api/v1/query` with that key in the `Authorization` header, each call debits $0.01 from the balance

```bash
curl https://tollgate.app/api/v1/query \
  -H "Authorization: Bearer tg_..." \
  -H "Content-Type: application/json" \
  -d '{"query": "explain arc testnet finality"}'
```

same 402-if-you-can't-pay behavior as the wallet flow, just billed against a balance instead of a fresh signature. balances are in-memory for now (see caveat below), so treat this as a proof of concept for the pattern, not a production billing system yet.

## why no smart contract

honest answer: scope. Arc's native gas token being USDC means a payment is just a value transfer, which meant I could spend the time on the verification logic instead of writing/testing/deploying Solidity for an MVP. the on-chain footprint right now is native transfers + server-side RPC checks, that's it.

**no contracts have been deployed for this project.** a settlement contract (escrow the fee, emit a receipt event, refund on failed inference) is the obvious next step, it's on the list below.

## stack

Next.js 14, TypeScript, Tailwind, ethers v6, Arc Testnet (chain id 5042002), Claude for inference, Vercel for hosting.

## running it

need Node 18+, a browser wallet, and an Anthropic API key.

```bash
git clone https://github.com/YOUR_USERNAME/tollgate
cd tollgate
npm install
cp .env.local.example .env.local
```

fill in `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...        # console.anthropic.com
NEXT_PUBLIC_AGENT_TREASURY=0x...    # wallet that receives payments
```

then:

```bash
npm run dev
```

open localhost:3000, hit "Launch App", connect, grab testnet USDC from the faucet if you need it.

| | |
|---|---|
| chain id | 5042002 (0x4CEF52) |
| rpc | rpc.testnet.arc.network |
| explorer | testnet.arcscan.app |
| faucet | faucet.circle.com |
| gas token | USDC, 18 decimals |

took me a minute to get the chain id right, by the way, there's a `0x1322` floating around in some places online that's wrong, the actual value is `0x4CEF52`. cost me an evening of "unrecognized chain" errors before I double checked it against the raw decimal.

## deploying

standard Vercel import. set `ANTHROPIC_API_KEY` and `NEXT_PUBLIC_AGENT_TREASURY` in project env vars. after the first deploy, also set `NEXT_PUBLIC_SITE_URL` to your actual deploy url and redeploy once, otherwise the share card image points at the wrong domain.

caveat I'm not going to pretend isn't there: Network/History stats and prepaid credit balances live in server memory right now, so they reset on cold starts. fine for a demo, would need a real datastore (and probably a proper ledger, not just a number in memory) before anyone should trust it with real balances.

## what's next

- persistent storage for stats and credit balances instead of in-memory
- settlement contract: escrow, per-query receipt events, refunds if inference fails
- Circle Wallets so people without a browser wallet can still pay
- rate limiting on both the verification endpoint and the API key endpoint, wide open right now
- proper key rotation/revocation instead of one static key per wallet
- pay-per-token instead of pay-per-query for longer generations

## Circle product feedback

**why USDC / why Arc:** per-query pricing wants a unit of account that doesn't move around on you. USDC being the native gas token on Arc also means the whole payment is just a transfer, small integration surface, any wallet that can sign a tx can pay this thing.

**what worked:** Arc looks like a normal EVM chain to ethers.js, so tooling wasn't an issue. finality is fast enough that pay → confirm → answer feels like one motion instead of three separate waits.

**what didn't:** I wrote raw JSON-RPC verification myself (`eth_getTransactionByHash`, then manually checking recipient/amount/confirmation). a small Circle SDK helper for "did address X pay Y to Z in tx H" would save everyone building payment-gated APIs from writing this same boilerplate. also lost real time to the chain id / decimals confusion mentioned above, a single canonical "add Arc Testnet" snippet in the docs would've saved me a night.

## license

MIT
