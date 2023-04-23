import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  SOLUTIO_PROGRAM_ID,
  CLOCKWORK_THREAD_PROGRAM_ID,
  THREAD_SEED,
  THREAD_AUTHORITY_SEED,
  TOKEN_AUTHORITY_SEED,
  PAYMENT_SEED,
  PROGRAM_AS_SIGNER_SEED,
} from "./constants";

export const getThreadPDA = (authority: PublicKey, id: number) => {
  return PublicKey.findProgramAddressSync(
    [
      THREAD_SEED,
      authority.toBuffer(),
      new Uint8Array(new BN(id).toArray("le", 1)),
    ],
    CLOCKWORK_THREAD_PROGRAM_ID
  );
};

export const getTokenAuthPDA = (
  taOwner: PublicKey,
  tokenAccount: PublicKey,
  receiverTokenAccount: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [
      TOKEN_AUTHORITY_SEED,
      taOwner.toBuffer(),
      tokenAccount.toBuffer(),
      receiverTokenAccount.toBuffer(),
    ],
    SOLUTIO_PROGRAM_ID
  );
};

export const getThreadAuthorityPDA = (taOwner: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [THREAD_AUTHORITY_SEED, taOwner.toBuffer()],
    SOLUTIO_PROGRAM_ID
  );
};

export const getPaymentPDA = (taOwner: PublicKey, threadKey: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [PAYMENT_SEED, taOwner.toBuffer(), threadKey.toBuffer()],
    SOLUTIO_PROGRAM_ID
  );
};

export const getProgramAsSignerPDA = () => {
  return PublicKey.findProgramAddressSync(
    [PROGRAM_AS_SIGNER_SEED],
    SOLUTIO_PROGRAM_ID
  );
};
