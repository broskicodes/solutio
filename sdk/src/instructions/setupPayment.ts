import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import {
  getPaymentPDA,
  SetupPaymentParmas,
  CLOCKWORK_THREAD_PROGRAM_ID,
  getThreadAuthorityPDA,
  getThreadPDA,
  getTokenAuthPDA,
} from "../utils";

export const setupPaymentIx = async ({
  taOwner,
  receiver,
  mint,
  transferAmount,
  threadId,
  threadTrigger,
  program,
}: SetupPaymentParmas) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver);
  const mintData = await getMint(program.provider.connection, mint);

  const [taAuth] = getTokenAuthPDA(taOwner, ta, receiverTa);
  const [threadAuth] = getThreadAuthorityPDA(taOwner);
  const [thread] = getThreadPDA(threadAuth, threadId);
  const [payment] = getPaymentPDA(taOwner, thread);

  const ix = await program.methods
    .setupNewPayment(
      transferAmount.muln(Math.pow(10, mintData.decimals)),
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
      thread,
      threadProgram: CLOCKWORK_THREAD_PROGRAM_ID,
    })
    .instruction();

  return ix;
};
