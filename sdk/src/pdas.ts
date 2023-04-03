import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  AUTOPAY_PROGRAM_ID,
  CLOCKWORK_THREAD_PROGRAM_ID,
  THREAD_SEED,
  THREAD_AUTHORITY_SEED,
  TOKEN_AUTHORITY_SEED,
} from "./constants";

export const getThreadPDA = (authority: PublicKey, id: BN) => {
  return PublicKey.findProgramAddressSync(
    [THREAD_SEED, authority.toBuffer(), new Uint8Array(id.toArray("le", 1))],
    CLOCKWORK_THREAD_PROGRAM_ID
  );
};

export const getTokenAuthPDA = (
  oldAuth: PublicKey,
  tokenAccount: PublicKey,
  receiverTokenAccount: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [
      TOKEN_AUTHORITY_SEED,
      oldAuth.toBuffer(),
      tokenAccount.toBuffer(),
      receiverTokenAccount.toBuffer(),
    ],
    AUTOPAY_PROGRAM_ID
  );
};

export const getThreadAuthorityPDA = (client: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [THREAD_AUTHORITY_SEED, client.toBuffer()],
    AUTOPAY_PROGRAM_ID
  );
};
