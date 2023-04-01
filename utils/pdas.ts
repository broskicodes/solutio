import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  AUTOPAY_PROGRAM_ID,
  CLOCKWORK_THREAD_PROGRAM_ID,
  THREAD,
  THREAD_AUTHORITY,
  TOKEN_AUTHORITY,
} from "./constants";

export const getThreadPDA = (authority: PublicKey, id: BN) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(THREAD),
      authority.toBuffer(),
      new Uint8Array(id.toArray("le", 1)),
    ],
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
      Buffer.from(TOKEN_AUTHORITY),
      oldAuth.toBuffer(),
      tokenAccount.toBuffer(),
      receiverTokenAccount.toBuffer(),
    ],
    AUTOPAY_PROGRAM_ID
  );
};

export const getThreadAuthorityPDA = (client: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(THREAD_AUTHORITY), client.toBuffer()],
    AUTOPAY_PROGRAM_ID
  );
};
