# Tollgate

pay-per-inference AI on [Arc](https://arc.network). send 0.01 USDC, get an answer. the payment gets checked on-chain before the model even runs, not just trusted client-side.

**demo:** https://tollgate.vercel.app *(swap for your deploy url)*

---

## the idea

most "AI + crypto" demos just slap a wallet connect button on a chatbot and call it a day. I wanted the payment to actually mean something, so the backend doesn't just trust the frontend's word that a payment happened, it goes and checks.

here's the flow. you connect a wallet and Tollgate adds Arc Testnet for you if it's not already there. you ask something and pay 0.01 USDC, which on Arc is just a normal transfer since USDC is the gas token, so no approve() dance. then the server hits Arc's RPC directly (`eth_getTransactionByHash`), confirms the tx is mined, checks it went to the right address, checks the amount. if any of that fails you get a 402 and no answer, full stop. only past that point does the query actually reach the model, and you get the answer back with a "verified on-chain" badge, the block number, and how long inference took.

there's also a demo toggle for people without a wallet installed. it's clearly marked as unverified so nobody mistakes it for the real flow.

## what's in the app

the Agent tab is the main query + pay screen. Network shows live numbers across everyone using this instance right now, total queries, USDC processed, who's paid the most. History is just your own past queries tied to your wallet. API is where the prepaid credits live (more on that below). Docs has the pay-then-verify pattern written out as code if you want to steal it.

## for developers: API + prepaid credits

signing a wallet transaction for every single query is fine in a browser but gets annoying fast if you're calling this from a script somewhere. so there's a second way in. connect your wallet once, go to the API tab, top up a prepaid balance (still a real on-chain payment, just credited to a balance instead of spent per call), and you get back an API key that looks like `tg_...`. from there:

```bash
curl https://tollgate.app/api/v1/query \
  -H "Authorization: Bearer tg_..." \
  -H "Content-Type: application/json" \
  -d '{"query": "explain arc testnet finality"}'
```

same 402-if-you-can't-pay behavior as the wallet flow, just billed against a balance instead of a fresh signature each time. balances live in memory for now (see the caveat further down), so this is really a proof of concept for the pattern more than a production billing system. don't put real money behind it yet.

## on-chain footprint

payments started as plain native transfers plus server-side RPC checks. no contract at all. that was a deliberate call for the first version, I'd rather spend the time getting the verification logic right than write Solidity for its own sake.

there's a small contract on top of that now, `TollgateReceipt.sol` in `contracts/`, deployed on Arc Testnet. it doesn't hold funds or gate anything by itself. it logs an event per paid query (payer, amount, a hash of the question, timestamp) so the payment history is verifiable on-chain instead of only living in server memory. the RPC verification on the server side is unchanged, this is additive on top of it.

what it's not yet, to be clear: no escrow, no refunds, no access control on the fee. those are the obvious next step. I'd rather ship the minimal version now and add to it than sit on something "complete" that never ships.

payments are also mid-migration onto [Arc App Kit](https://docs.arc.io/app-kit) (`@circle-fin/app-kit`) instead of the hand-rolled ethers.js transfer I started with. `src/lib/appkit.ts` has the new path, `src/lib/arc.ts` still has the manual version as a fallback while I finish testing the swap. probably should've started with App Kit honestly, but I didn't know it existed until partway through.

## stack

Next.js 14, TypeScript, Tailwind, ethers v6, Arc App Kit (still migrating onto it), Solidity + Hardhat for the receipt contract, Arc Testnet (chain id 5042002), Claude for inference, Vercel for hosting.

## running it

you'll need Node 18+, a browser wallet, and an Anthropic API key.

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

then `npm run dev`, open localhost:3000, hit "Launch App", connect a wallet, grab testnet USDC from the faucet if you need some.

| | |
|---|---|
| chain id | 5042002 (0x4CEF52) |
| rpc | rpc.testnet.arc.network |
| explorer | testnet.arcscan.app |
| faucet | faucet.circle.com |
| gas token | USDC, 18 decimals |

side note, took me way longer than it should have to get the chain id right. there's a `0x1322` floating around online in a few places that's just wrong, the actual hex is `0x4CEF52`. burned most of an evening on "unrecognized chain" errors before I sat down and converted the decimal myself instead of trusting a random forum post.

## deploying

standard Vercel import, set `ANTHROPIC_API_KEY` and `NEXT_PUBLIC_AGENT_TREASURY` in project env vars. after the first deploy also set `NEXT_PUBLIC_SITE_URL` to your actual url and redeploy once, otherwise the share card image points at the wrong domain, learned that one the hard way too.

caveat I'm not going to hide: Network/History stats and prepaid credit balances live in server memory right now, so they reset on cold starts. that's fine for a demo but you'd want a real datastore, and honestly a proper ledger instead of just a number sitting in memory, before trusting it with anything real.

### deploying the receipt contract (optional, testnet only)

```bash
npm run compile
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:testnet
```

needs a funded Arc Testnet wallet for gas, paid in USDC since that's the native gas token here. the deploy script reads `NEXT_PUBLIC_AGENT_TREASURY` from your env for the treasury address. this is testnet only and will stay that way for a while, Arc itself doesn't even have a mainnet yet as of writing this.

## what's next

roughly in order of what I actually care about fixing first:

persistent storage instead of in-memory for stats and credit balances. escrow and refunds on the receipt contract, right now it just logs and doesn't hold anything. finishing the App Kit migration, I'm still half on the old manual path. Circle Wallets so people without a browser wallet installed can actually use this. rate limiting on both the verification endpoint and the API key endpoint, which right now are both wide open to anyone who finds them. real key rotation instead of one static key per wallet forever. pay-per-token instead of pay-per-query once generations get longer.

longer term I keep coming back to ERC-8004 and ERC-8183, Arc's agent identity and job-settlement standards, for doing this agent-to-agent instead of just human-to-agent. that's the actual interesting version of this project, everything so far has been building toward being able to say that sentence and mean it.

## Circle product feedback

why USDC, why Arc: per-query pricing wants a unit of account that doesn't move around on you mid-transaction. USDC being the native gas token on Arc also means the whole payment is just a transfer, small integration surface, any wallet that can sign a tx can pay this thing without needing to hold some other token first.

what worked: Arc looks like a normal EVM chain to ethers.js so tooling wasn't really an issue. finality is fast enough that pay, confirm, answer feels like one motion instead of three separate waits, which matters more for the UX than I expected going in. App Kit's `send` call is genuinely nice once it's wired up, one function instead of building the transaction by hand.

what didn't: I wrote raw JSON-RPC verification myself before finding App Kit, manually checking recipient, amount, confirmation off `eth_getTransactionByHash`. a small SDK helper for "did address X pay Y to Z in tx H" would save everyone building payment-gated APIs from writing the same boilerplate I did, App Kit covers sending but not the verify-a-payment-happened side. also lost real time to the chain id and decimals confusion mentioned above, one canonical "add Arc Testnet" snippet in the docs would've saved me an evening. and the ERC-8004/8183 standards are exactly what I want for the agent-to-agent version of this, but docs for them are thin right now compared to App Kit, more worked examples there would help a lot.

## license

MIT
