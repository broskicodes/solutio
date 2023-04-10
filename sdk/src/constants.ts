import { PublicKey } from "@solana/web3.js";

// Seeds
export const THREAD_SEED = Buffer.from("thread");
export const TOKEN_AUTHORITY_SEED = Buffer.from("token_authority");
export const THREAD_AUTHORITY_SEED = Buffer.from("thread_authority");
export const PAYMENT_SEED = Buffer.from("payment");

// Pubkeys
export const AUTOPAY_PROGRAM_ID = new PublicKey(
  "2wPTyb77aTevaxD9jvKNQqo9MMLAMM9nGYACMoAZReaR"
);
export const CLOCKWORK_THREAD_PROGRAM_ID = new PublicKey(
  "CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh"
);
export const COMPUTE_BUDGET_PROGRAM_ID = new PublicKey(
  "ComputeBudget111111111111111111111111111111"
);

// Misc
export const NEXT_THREAD_ID_INDEX = 8 + 32;
