import { Program, BN } from "@coral-xyz/anchor";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getTokenAuthPDA } from "../pdas";

export const delegateTransferAuthority = async (
  taOwner: Keypair,
  receiver: PublicKey,
  mint: PublicKey,
  delAmnt: BN,
  program: Program
) => {
  const ta = (
    await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      taOwner,
      mint,
      taOwner.publicKey
    )
  ).address;

  const receiverTa = (
    await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      taOwner,
      mint,
      receiver
    )
  ).address;

  const [taAuth] = getTokenAuthPDA(taOwner.publicKey, ta, receiverTa);

  await program.methods
    .delegateTransferAuthority(delAmnt)
    .accounts({
      newAuthority: taAuth,
      mint,
      tokenAccount: ta,
      receiverTokenAccount: receiverTa,
      receiver: receiver,
      oldAuthority: taOwner.publicKey,
    })
    .signers([taOwner])
    .rpc();
};
