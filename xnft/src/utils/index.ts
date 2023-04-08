import { BN, Program, Provider } from "@coral-xyz/anchor";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { ThreadTrigger } from "@soltility/autopay-sdk";

export const signAndSendTransaction = async (
  intructions: TransactionInstruction[],
  provider: Provider
) => {
  const tx = new Transaction();
  tx.add(...intructions);

  if (!provider.sendAndConfirm) {
    console.log("Cannot send tx");
    return;
  }

  const txSig = await provider.sendAndConfirm(tx);

  return txSig;
};
