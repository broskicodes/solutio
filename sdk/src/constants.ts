import { PublicKey } from "@solana/web3.js";

// Seeds
export const THREAD_SEED = Buffer.from("thread");
export const TOKEN_AUTHORITY_SEED = Buffer.from("token_authority");
export const THREAD_AUTHORITY_SEED = Buffer.from("thread_authority");

// Pubkeys
export const AUTOPAY_PROGRAM_ID = new PublicKey(
  "5FLhLmmJFpLeKyqwHC34bmELNLZFutKTqdxtqmimiMSo"
);
export const CLOCKWORK_THREAD_PROGRAM_ID = new PublicKey(
  "CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh"
);
export const COMPUTE_BUDGET_PROGRAM_ID = new PublicKey(
  "ComputeBudget111111111111111111111111111111"
);
