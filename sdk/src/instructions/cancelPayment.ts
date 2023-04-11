import { getAssociatedTokenAddress } from "@solana/spl-token";
import { CancelPaymentParams } from "src/utils";
import { CLOCKWORK_THREAD_PROGRAM_ID } from "../utils/constants";
import {
  getPaymentPDA,
  getThreadAuthorityPDA,
  getThreadPDA,
  getTokenAuthPDA,
} from "../utils/pdas";

export const cancelPaymentIx = async ({
  taOwner,
  receiver,
  mint,
  threadId,
  program,
}: CancelPaymentParams) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver);

  const [taAuth] = getTokenAuthPDA(taOwner, ta, receiverTa);
  const [threadAuth] = getThreadAuthorityPDA(taOwner);
  const [thread] = getThreadPDA(threadAuth, threadId);
  const [payment] = getPaymentPDA(taOwner, thread);

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
      tokenAccountOwner: taOwner,
      thread,
      threadProgram: CLOCKWORK_THREAD_PROGRAM_ID,
    })
    .instruction();

  return ix;
};
