import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import {
  UpdatePaymentParams,
  CLOCKWORK_THREAD_PROGRAM_ID,
  getPaymentPDA,
  getThreadAuthorityPDA,
  getThreadPDA,
  getTokenAuthPDA,
  getProgramAsSignerPDA,
} from "../utils";
import { BN } from "@coral-xyz/anchor";

export const updatePaymentIx = async ({
  taOwner,
  receiver,
  mint,
  threadId,
  program,
  newAmount,
  newSchedule,
}: UpdatePaymentParams) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver, true);

  let bnAmount: BN | null = null;
  if (newAmount) {
    const mintData = await getMint(program.provider.connection, mint);
    bnAmount = new BN(newAmount * Math.pow(10, mintData.decimals));
  }

  const [taAuth] = getTokenAuthPDA(taOwner, ta, receiverTa);
  const [threadAuth] = getThreadAuthorityPDA(taOwner);
  const [thread] = getThreadPDA(threadAuth, threadId);
  const [payment] = getPaymentPDA(taOwner, thread);
  const [programSigner] = getProgramAsSignerPDA();
  const programTa = await getAssociatedTokenAddress(mint, programSigner, true);

  const optAcnts = newAmount
    ? {
        tokenAccountAuthority: taAuth,
        mint,
        tokenAccount: ta,
        receiverTokenAccount: receiverTa,
        receiver,
        programAsSigner: programSigner,
        programTokenAccount: programTa,
      }
    : {
        tokenAccountAuthority: undefined,
        mint: undefined,
        tokenAccount: undefined,
        receiverTokenAccount: undefined,
        receiver: undefined,
        programAsSigner: undefined,
        programTokenAccount: undefined,
      };

  const ix = await program.methods
    .updatePayment(threadId, newSchedule, bnAmount)
    .accounts({
      threadAuthority: threadAuth,
      payment,
      tokenAccountOwner: taOwner,
      thread,
      threadProgram: CLOCKWORK_THREAD_PROGRAM_ID,
      ...optAcnts,
    })
    .instruction();

  return ix;
};
