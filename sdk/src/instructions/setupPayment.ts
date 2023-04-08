import { Program, BN } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { CLOCKWORK_THREAD_PROGRAM_ID } from "../constants";
import { ThreadTrigger } from "../helpers";
import {
  getPaymentPDA,
  getThreadAuthorityPDA,
  getThreadPDA,
  getTokenAuthPDA,
} from "../pdas";

export const setupPayment = async (
  taOwner: Keypair | Wallet,
  receiver: PublicKey,
  mint: PublicKey,
  amount: BN,
  threadId: number,
  threadTrigger: ThreadTrigger,
  program: Program
) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner.publicKey);

  const receiverTa = await getAssociatedTokenAddress(mint, receiver);

  const [taAuth] = getTokenAuthPDA(taOwner.publicKey, ta, receiverTa);
  const [threadAuth] = getThreadAuthorityPDA(taOwner.publicKey);
  const [thread] = getThreadPDA(threadAuth, threadId);
  const [payment] = getPaymentPDA(taOwner.publicKey, thread);

  const ix = await program.methods
    .setupNewPayment(amount, threadTrigger)
    .accounts({
      tokenAccountAuthority: taAuth,
      threadAuthority: threadAuth,
      payment,
      mint,
      tokenAccount: ta,
      receiverTokenAccount: receiverTa,
      receiver,
      tokenAccountOwner: taOwner.publicKey,
      thread,
      threadProgram: CLOCKWORK_THREAD_PROGRAM_ID,
    })
    .instruction();

  return ix;
};
