import { BN, Idl, Program, Provider } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, PublicKey, Connection } from "@solana/web3.js";
import autopayIdl from "../AutopayIDL.json";
import { AUTOPAY_PROGRAM_ID, NEXT_THREAD_ID_INDEX } from "./constants";

export interface ThreadTrigger {
  now?: {};
  cron?: { scheduleStr: String };
}

export interface PaymentStatus {
  active?: {};
  cancelled?: {};
  complete?: {};
}

export interface PaymentType {
  threadAuthority: PublicKey;
  tokenAuthority: PublicKey;
  threadKey: PublicKey;
  threadId: number;
  payer: PublicKey;
  receiver: PublicKey;
  mint: PublicKey;
  status: PaymentStatus;
  amount: BN;
  schedule: ThreadTrigger;
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
