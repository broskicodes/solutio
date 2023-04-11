import { Idl, Program, Provider } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  PublicKey,
  Connection,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import solutioIdl from "../../SolutioIDL.json";
import { SOLUTIO_PROGRAM_ID, NEXT_THREAD_ID_INDEX } from "./constants";

export const getSolutioProgram = (provider: Provider): Program => {
  return new Program(solutioIdl as Idl, SOLUTIO_PROGRAM_ID, provider);
};

export const airdrop = async (
  connection: Connection,
  publicKey: PublicKey,
  lamports: number
) => {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  await connection.confirmTransaction(
    {
      signature: await connection.requestAirdrop(publicKey, lamports),
      blockhash,
      lastValidBlockHeight,
    },
    "confirmed"
  );
};

export const requestExtraCompute = (amount: number) => {
  return ComputeBudgetProgram.setComputeUnitLimit({
    units: amount,
  });
};

export const sleep = (secs: number) => {
  return new Promise((resolve) => setTimeout(resolve, secs * 1000));
};

export const getNextThreadId = async (
  connection: Connection,
  threadAuthorityKey: PublicKey
) => {
  const info = await connection.getAccountInfo(threadAuthorityKey);

  if (!info) {
    return 0;
  }

  return info.data[NEXT_THREAD_ID_INDEX];
};

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

export const serializeTransactionToBase64 = (
  intructions: TransactionInstruction[]
) => {
  const tx = new Transaction();
  tx.add(...intructions);

  const serializedTx = tx.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  });

  return serializedTx.toString("base64");
};
