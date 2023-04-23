import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { DelegateTransferAuthorityParams, getTokenAuthPDA } from "../utils";
import { BN } from "@coral-xyz/anchor";

export const delegateTransferAuthorityIx = async ({
  taOwner,
  receiver,
  mint,
  delegateAmount,
  program,
}: DelegateTransferAuthorityParams) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver, true);
  const mintData = await getMint(program.provider.connection, mint);

  const [taAuth] = getTokenAuthPDA(taOwner, ta, receiverTa);

  const ix = await program.methods
    .delegateTransferAuthority(
      new BN(delegateAmount * Math.pow(10, mintData.decimals))
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
