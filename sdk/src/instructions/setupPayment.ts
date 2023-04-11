import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { SetupPaymentParmas } from "src/utils";
import { CLOCKWORK_THREAD_PROGRAM_ID } from "../utils/constants";
import {
  getPaymentPDA,
  getThreadAuthorityPDA,
  getThreadPDA,
  getTokenAuthPDA,
} from "../utils/pdas";

export const setupPaymentIx = async ({
  taOwner,
  receiver,
  mint,
  amount,
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
    .setupNewPayment(amount.muln(Math.pow(10, mintData.decimals)), threadTrigger)
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
