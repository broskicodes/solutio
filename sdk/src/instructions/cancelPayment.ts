import { Program } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { CLOCKWORK_THREAD_PROGRAM_ID } from "../constants";
import {
  getPaymentPDA,
  getThreadAuthorityPDA,
  getThreadPDA,
  getTokenAuthPDA,
} from "../pdas";

export const cancelPayment = async (
  taOwner: Keypair | Wallet,
  receiver: PublicKey,
  mint: PublicKey,
  threadId: number,
  program: Program
) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner.publicKey);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver);

  const [taAuth] = getTokenAuthPDA(taOwner.publicKey, ta, receiverTa);
  const [threadAuth] = getThreadAuthorityPDA(taOwner.publicKey);
  const [thread] = getThreadPDA(threadAuth, threadId);
  const [payment] = getPaymentPDA(taOwner.publicKey, thread);

  console.log("taa", await program.provider.connection.getAccountInfo(taAuth));
  console.log(
    "ta",
    await program.provider.connection.getAccountInfo(threadAuth)
  );
  console.log("t", await program.provider.connection.getAccountInfo(thread));
  console.log("p", await program.provider.connection.getAccountInfo(payment));

  const ix = await program.methods
    .cancelPayment(threadId)
    .accounts({
      threadAuthority: threadAuth,
      tokenAccountAuthority: taAuth,
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
