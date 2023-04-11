import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { DelegateTransferAuthority, getTokenAuthPDA } from "../utils";

export const delegateTransferAuthorityIx = async ({
  taOwner,
  receiver,
  mint,
  delegateAmount,
  program,
}: DelegateTransferAuthority) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver);
  const mintData = await getMint(program.provider.connection, mint);

  const [taAuth] = getTokenAuthPDA(taOwner, ta, receiverTa);

  const ix = await program.methods
    .delegateTransferAuthority(
      delegateAmount.muln(Math.pow(10, mintData.decimals))
    )
    .accounts({
      newAuthority: taAuth,
      mint,
      tokenAccount: ta,
      receiverTokenAccount: receiverTa,
      receiver,
      tokenAccountOwner: taOwner,
    })
    .instruction();

  return ix;
};
