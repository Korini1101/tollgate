// Payment via Arc App Kit instead of a hand-rolled ethers.js transfer.
// App Kit (@circle-fin/app-kit) wraps the underlying send/bridge/swap
// calls behind one typed interface, so this file replaces the manual
// sendTransaction() call that used to live in arc.ts with the same
// thing, but going through Circle's maintained SDK.
//
// docs: https://docs.arc.io/app-kit

import { createAppKit } from "@circle-fin/app-kit";
import { viemAdapter } from "@circle-fin/adapter-viem-v2";
import { TREASURY_ADDR } from "./constants";

const kit = createAppKit();

export interface AppKitPaymentResult {
  txHash: string;
  amount: string;
  from: string;
  timestamp: number;
}

// Sends 0.01 USDC on Arc Testnet using App Kit's `send` capability.
// Falls back to being a thin wrapper, the actual signing still happens
// in the connected wallet, App Kit just handles chain/token routing.
export async function payWithAppKit(fromAddress: string): Promise<AppKitPaymentResult> {
  const result = await kit.send({
    from: { adapter: viemAdapter, chain: "Arc_Testnet" },
    to: TREASURY_ADDR,
    amount: "0.01",
    token: "USDC",
  });

  return {
    txHash: result.transactionHash,
    amount: "0.01",
    from: fromAddress,
    timestamp: Date.now(),
  };
}
