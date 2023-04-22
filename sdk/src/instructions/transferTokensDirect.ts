import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { TransferTokensDirectParams, getProgramAsSignerPDA } from "../utils";

export const directTransferIx = async ({
  taOwner,
  receiver,
  mint,
  amount,
  program,
}: TransferTokensDirectParams) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver);
  const mintData = await getMint(program.provider.connection, mint);

  const [programSigner] = getProgramAsSignerPDA();
  const programTa = await getAssociatedTokenAddress(mint, programSigner, true);

  const ix = await program.methods
    .transferTokensDirect(
      amount.muln(Math.pow(10, mintData.decimals))
    )
    .accounts({
      mint,
      tokenAccount: ta,
      receiverTokenAccount: receiverTa,
      tokenAccountOwner: taOwner,
      receiver,
      programAsSigner: programSigner,
      programTokenAccount: programTa
    })
    .instruction();

  return ix;
};
