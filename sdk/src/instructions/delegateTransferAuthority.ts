import { Program, BN } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getTokenAuthPDA } from "../pdas";

export const delegateTransferAuthority = async (
  taOwner: Keypair | Wallet,
  receiver: PublicKey,
  mint: PublicKey,
  delAmnt: BN,
  program: Program
) => {
  const ta = await getAssociatedTokenAddress(mint, taOwner.publicKey);
  const receiverTa = await getAssociatedTokenAddress(mint, receiver);
  const mintData = await getMint(program.provider.connection, mint);

  const [taAuth] = getTokenAuthPDA(taOwner.publicKey, ta, receiverTa);

  const ix = await program.methods
    .delegateTransferAuthority(delAmnt.muln(Math.pow(10, mintData.decimals)))
    .accounts({
      newAuthority: taAuth,
      mint,
      tokenAccount: ta,
      receiverTokenAccount: receiverTa,
      receiver,
      tokenAccountOwner: taOwner.publicKey,
    })
    .instruction();

  return ix;
};
