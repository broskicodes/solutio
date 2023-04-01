import { Program, BN } from "@coral-xyz/anchor";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { CLOCKWORK_THREAD_PROGRAM_ID } from "../constants";
import { ThreadTrigger } from "../helpers";
import { getThreadAuthorityPDA, getThreadPDA, getTokenAuthPDA } from "../pdas";

export const updatePayment = async (
  client: Keypair,
  taOwner: Keypair,
  receiver: PublicKey,
  mint: PublicKey,
  threadId: number,
  program: Program,
  newAmount: BN | null,
  newSchedlue: ThreadTrigger | null
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

  const optAcnts = newAmount
    ? {
        tokenAccountAuthority: taAuth,
        mint,
        tokenAccount: ta,
        receiverTokenAccount: receiverTa,
        receiver: receiver,
        oldAuthority: taOwner.publicKey,
      }
    : {
        tokenAccountAuthority: null,
        mint: null,
        tokenAccount: null,
        receiverTokenAccount: null,
        receiver: null,
        oldAuthority: null,
      };

  await program.methods
    .updatePayment(threadId, newSchedlue, newAmount)
    .accounts({
      threadAuthority: threadAuth,
      client: client.publicKey,
      thread,
      threadProgram: CLOCKWORK_THREAD_PROGRAM_ID,
      ...optAcnts,
    })
    .signers([client, taOwner])
    .rpc();
};
