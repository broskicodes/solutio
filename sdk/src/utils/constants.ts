import { PublicKey } from "@solana/web3.js";

// Seeds
export const THREAD_SEED = Buffer.from("thread");
export const TOKEN_AUTHORITY_SEED = Buffer.from("token_authority");
export const THREAD_AUTHORITY_SEED = Buffer.from("thread_authority");
export const PAYMENT_SEED = Buffer.from("payment");

// Pubkeys
export const SOLUTIO_PROGRAM_ID = new PublicKey(
  // "2wPTyb77aTevaxD9jvKNQqo9MMLAMM9nGYACMoAZReaR"
  "8sbSXaprHK3Mr9ft8QpAQqZHz4PEsaSH9dv5gAGtqcow"
);
export const CLOCKWORK_THREAD_PROGRAM_ID = new PublicKey(
  "CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh"
);
export const COMPUTE_BUDGET_PROGRAM_ID = new PublicKey(
  "ComputeBudget111111111111111111111111111111"
);

// Misc
export const NEXT_THREAD_ID_INDEX = 8 + 32;
export const SOLANA_PAY_SERVER_URL = "https://sp.soruchio.xyz";
