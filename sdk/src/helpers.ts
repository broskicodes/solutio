import { Idl, Program, Provider } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, PublicKey, Connection, TransactionInstruction } from "@solana/web3.js";
import autopayIdl from "../AutopayIDL.json";
import { AUTOPAY_PROGRAM_ID } from "./constants";

export interface ThreadTrigger {
  now?: {};
  cron?: { scheduleStr: String };
}

export const getAutopayProgram = (provider: Provider): Program => {
  return new Program(autopayIdl as Idl, AUTOPAY_PROGRAM_ID, provider);
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

// export const signAndSendTransaction = async (instructions: TransactionInstruction[], signers: )