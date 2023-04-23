import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import {
  getPaymentPDA,
  SetupPaymentParmas,
  CLOCKWORK_THREAD_PROGRAM_ID,
  getThreadAuthorityPDA,
  getThreadPDA,
  getTokenAuthPDA,
  getProgramAsSignerPDA,
  getNextThreadId,
} from "../utils";
import { BN } from "@coral-xyz/anchor";

export const setupPaymentIx = async ({
  taOwner,
  receiver,
  mint,
  transferAmount,
  threadTrigger,
  program,
}: SetupPaymentParmas) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver, true);
  const mintData = await getMint(program.provider.connection, mint);

  const [taAuth] = getTokenAuthPDA(taOwner, ta, receiverTa);
  const [threadAuth] = getThreadAuthorityPDA(taOwner);
  const nextThreadId = await getNextThreadId(
    program.provider.connection,
    threadAuth
  );
  const [thread] = getThreadPDA(threadAuth, nextThreadId);
  const [payment] = getPaymentPDA(taOwner, thread);
  const [programSigner] = getProgramAsSignerPDA();
  const programTa = await getAssociatedTokenAddress(mint, programSigner, true);

  const ix = await program.methods
    .setupNewPayment(
      new BN(transferAmount * Math.pow(10, mintData.decimals)),
      threadTrigger
    )
    .accounts({
      tokenAccountAuthority: taAuth,
      threadAuthority: threadAuth,
      payment,
      mint,
      tokenAccount: ta,
      receiverTokenAccount: receiverTa,
      receiver,
      tokenAccountOwner: taOwner,
      programAsSigner: programSigner,
      programTokenAccount: programTa,
      thread,
      threadProgram: CLOCKWORK_THREAD_PROGRAM_ID,
    })
    .instruction();

  return ix;
};
