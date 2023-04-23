import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { TransferTokensDirectParams, getProgramAsSignerPDA } from "../utils";
import { BN } from "@coral-xyz/anchor";

export const directTransferIx = async ({
  taOwner,
  receiver,
  mint,
  amount,
  program,
}: TransferTokensDirectParams) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver, true);
  const mintData = await getMint(program.provider.connection, mint);

  const [programSigner] = getProgramAsSignerPDA();
  const programTa = await getAssociatedTokenAddress(mint, programSigner, true);

  const ix = await program.methods
    .transferTokensDirect(new BN(amount * Math.pow(10, mintData.decimals)))
    .accounts({
      mint,
      tokenAccount: ta,
      receiverTokenAccount: receiverTa,
      tokenAccountOwner: taOwner,
      receiver,
      programAsSigner: programSigner,
      programTokenAccount: programTa,
    })
    .instruction();

  return ix;
};
