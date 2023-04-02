import { Program, BN } from "@coral-xyz/anchor";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { CLOCKWORK_THREAD_PROGRAM_ID } from "../constants";
import { ThreadTrigger } from "../helpers";
import { getThreadAuthorityPDA, getThreadPDA, getTokenAuthPDA } from "../pdas";

export const setupPayment = async (
  client: Keypair,
  taOwner: Keypair,
  receiver: PublicKey,
  mint: PublicKey,
  amount: BN,
  threadId: number,
  threadTrigger: ThreadTrigger,
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
  const [threadAuth] = getThreadAuthorityPDA(client.publicKey);
  const [thread] = getThreadPDA(threadAuth, threadId);

  const ix = await program.methods
    .setupNewPayment(amount, threadTrigger)
    .accounts({
      tokenAccountAuthority: taAuth,
      threadAuthority: threadAuth,
      client: client.publicKey,
      mint,
      tokenAccount: ta,
      receiverTokenAccount: receiverTa,
      receiver: receiver,
      oldAuthority: taOwner.publicKey,
      thread,
      threadProgram: CLOCKWORK_THREAD_PROGRAM_ID,
    })
    .signers([taOwner, client])
    .instruction();

    return ix;
};
