import { Program } from "@coral-xyz/anchor";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { CLOCKWORK_THREAD_PROGRAM_ID } from "../constants";
import { getThreadAuthorityPDA, getThreadPDA, getTokenAuthPDA } from "../pdas";

export const cancelPayment = async (
  taOwner: Keypair,
  receiver: PublicKey,
  mint: PublicKey,
  threadId: number,
  program: Program
) => {
  const ta = (
    await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      taOwner,
      mint,
      taOwner.publicKey
    )
  ).address;

  const receiverTa = (
    await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      taOwner,
      mint,
      receiver
    )
  ).address;

  const [taAuth] = getTokenAuthPDA(taOwner.publicKey, ta, receiverTa);
  const [threadAuth] = getThreadAuthorityPDA(taOwner.publicKey);
  const [thread] = getThreadPDA(threadAuth, threadId);

  const ix = await program.methods
    .cancelPayment(threadId)
    .accounts({
      threadAuthority: threadAuth,
      tokenAccountAuthority: taAuth,
      mint,
      tokenAccount: ta,
      receiverTokenAccount: receiverTa,
      receiver: receiver,
      tokenAccountOwner: taOwner.publicKey,
      thread,
      threadProgram: CLOCKWORK_THREAD_PROGRAM_ID,
    })
    .instruction();

  return ix;
};
