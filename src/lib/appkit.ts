// AppKit import confirmed via Circle's docs. Browser-wallet (MetaMask)
// adapter not confirmed yet, so send stays on arc.ts for now.

import { AppKit } from "@circle-fin/app-kit";

export const kit = new AppKit();

export interface AppKitPaymentResult {
  txHash: string;
  amount: string;
  from: string;
  timestamp: number;
}

export async function payWithAppKit():