import { BN, Idl, Program, Provider } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, PublicKey, Connection } from "@solana/web3.js";
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
