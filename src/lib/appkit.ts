import { AppKit } from "@circle-fin/app-kit";

export const kit = new AppKit();

export interface AppKitPaymentResult {
  txHash: string;
  amount: string;
  from: string;
  timestamp: number;
}

export async function payWithAppKit(): Promise<AppKitPaymentResult> {
  throw new Error("not wired up yet, use arc.ts");
}