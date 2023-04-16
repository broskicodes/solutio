import { Provider } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
// import { readFile } from "react-native-fs";

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

export const TEST_MINT_ADDRESS = new PublicKey(
  "C4PgQJM9euWvkpfVeDdVeFGFZc1GPcE5dJk3t4o9y9oE"
);
export const TEST_MINT_AMOUNT = Math.pow(10, 3);
