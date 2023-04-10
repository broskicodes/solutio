import { Program, BN } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { CLOCKWORK_THREAD_PROGRAM_ID } from "../constants";
import { ThreadTrigger } from "../helpers";
import {
  getPaymentPDA,
  getThreadAuthorityPDA,
  getThreadPDA,
  getTokenAuthPDA,
} from "../pdas";

export const updatePayment = async (
  taOwner: Keypair | Wallet,
  receiver: PublicKey,
  mint: PublicKey,
  threadId: number,
  program: Program,
  newAmount: BN | null,
  newSchedlue: ThreadTrigger | null
) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner.publicKey);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver);

  if (newAmount) {
    const mintData = await getMint(program.provider.connection, mint);
    newAmount = newAmount.muln(mintData.decimals);
  }

  const [taAuth] = getTokenAuthPDA(taOwner.publicKey, ta, receiverTa);
  const [threadAuth] = getThreadAuthorityPDA(taOwner.publicKey);
  const [thread] = getThreadPDA(threadAuth, threadId);
  const [payment] = getPaymentPDA(taOwner.publicKey, thread);

  const optAcnts = newAmount
    ? {
        tokenAccountAuthority: taAuth,
        mint,
        tokenAccount: ta,
        receiverTokenAccount: receiverTa,
        receiver,
      }
    : {
        tokenAccountAuthority: undefined,
        mint: undefined,
        tokenAccount: undefined,
        receiverTokenAccount: undefined,
        receiver: undefined,
      };

  const ix = await program.methods
    .updatePayment(threadId, newSchedlue, newAmount)
    .accounts({
      threadAuthority: threadAuth,
      payment,
      tokenAccountOwner: taOwner.publicKey,
      thread,
      threadProgram: CLOCKWORK_THREAD_PROGRAM_ID,
      ...optAcnts,
    })
    .instruction();

  return ix;
};
