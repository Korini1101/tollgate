import { randomBytes } from "crypto";

// Prepaid credit accounts, keyed by wallet address. Shared in-memory store
// used by both /api/credits (browser-facing) and /api/v1/query (API-key
// facing). Split into its own module so it's not living inside a route
// file that Next.js expects to only export HTTP handlers from.
export type Account = {
  apiKey: string;
  balance: number;
  spent: number;
  queries: number;
};

const accounts: Record<string, Account> =
  (globalThis as unknown as { __tollgateCredits?: Record<string, Account> })
    .__tollgateCredits ?? {};
(globalThis as unknown as { __tollgateCredits?: Record<string, Account> }).__tollgateCredits =
  accounts;

export function getOrCreateAccount(wallet: string): Account {
  const key = wallet.toLowerCase();
  if (!accounts[key]) {
    accounts[key] = {
      apiKey: `tg_${randomBytes(16).toString("hex")}`,
      balance: 0,
      spent: 0,
      queries: 0,
    };
  }
  return accounts[key];
}

function findWalletByApiKey(apiKey: string): string | undefined {
  return Object.entries(accounts).find(([, acc]) => acc.apiKey === apiKey)?.[0];
}

export function debitByApiKey(apiKey: string, amount: number): boolean {
  const wallet = findWalletByApiKey(apiKey);
  if (!wallet) return false;
  const acc = accounts[wallet];
  if (acc.balance < amount) return false;
  acc.balance -= amount;
  acc.spent += amount;
  acc.queries += 1;
  return true;
}
