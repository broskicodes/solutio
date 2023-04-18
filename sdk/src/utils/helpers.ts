import { Idl, Program, Provider } from "@coral-xyz/anchor";
import { createQR, encodeURL } from "@solana/pay";
import {
  ComputeBudgetProgram,
  PublicKey,
  Connection,
  TransactionInstruction,
  Transaction,
  Keypair,
} from "@solana/web3.js";
import { BN } from "bn.js";
import solutioIdl from "../../SolutioIDL.json";
import {
  SOLUTIO_PROGRAM_ID,
  NEXT_THREAD_ID_INDEX,
  SOLANA_PAY_SERVER_URL,
} from "./constants";
import {
  CancelRequestParams,
  ConvertableString,
  PaymentType,
  SeriaizeablePaymentType,
  SetupRequestParams,
  ThreadTrigger,
  UpdateRequestParams,
} from "./models";

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
  provider: Provider,
  signers: Keypair[] = []
) => {
  const tx = new Transaction();
  tx.add(...intructions);

  if (!provider.sendAndConfirm) {
    console.log("Cannot send tx");
    return;
  }

  const txSig = await provider.sendAndConfirm(tx, signers);

  return txSig;
};

export const serializeTransactionToBase64 = (
  intructions: TransactionInstruction[],
  recentBlockhash: string,
  lastValidBlockHeight: number
) => {
  const tx = new Transaction({
    feePayer: new PublicKey("11111111111111111111111111111111"),
    blockhash: recentBlockhash,
    lastValidBlockHeight,
  });
  tx.add(...intructions);

  const serializedTx = tx.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  });

  return serializedTx.toString("base64");
};

export const constructSetupIxQR = async ({
  receiver,
  mint,
  amount,
  threadSchedule,
  delegateAmount,
}: Omit<SetupRequestParams, "taOwner">) => {
  const link = new URL(`${SOLANA_PAY_SERVER_URL}/setup`);

  receiver ? link.searchParams.append("receiver", receiver) : {};
  mint ? link.searchParams.append("mint", mint) : {};
  amount ? link.searchParams.append("amount", amount.toString()) : {};
  threadSchedule
    ? link.searchParams.append("threadSchedule", threadSchedule)
    : {};
  delegateAmount
    ? link.searchParams.append("delegateAmount", delegateAmount.toString())
    : {};

  const spUrl = encodeURL({ link });
  const qr = createQR(spUrl, 400);

  return qr;
};

export const constructUpdateIxQR = async ({
  receiver,
  mint,
  threadId,
  newAmount,
  newSchedule,
}: Omit<UpdateRequestParams, "taOwner">) => {
  const link = new URL(`${SOLANA_PAY_SERVER_URL}/update`);

  receiver ? link.searchParams.append("receiver", receiver) : {};
  mint ? link.searchParams.append("mint", mint) : {};
  threadId ? link.searchParams.append("threadId", threadId.toString()) : {};
  newAmount ? link.searchParams.append("newAmount", newAmount.toString()) : {};
  newSchedule ? link.searchParams.append("newSchedule", newSchedule) : {};

  const spUrl = encodeURL({ link });
  const qr = createQR(spUrl, 400);

  return qr;
};

export const constructCancelIxQR = async ({
  receiver,
  mint,
  threadId,
}: Omit<CancelRequestParams, "taOwner">) => {
  const link = new URL(`${SOLANA_PAY_SERVER_URL}/cancel`);

  receiver ? link.searchParams.append("receiver", receiver) : {};
  mint ? link.searchParams.append("mint", mint) : {};
  threadId ? link.searchParams.append("threadId", threadId.toString()) : {};

  const spUrl = encodeURL({ link });
  const qr = createQR(spUrl, 400);

  return qr;
};

/*
  Format of cron schedule:
  sec  min   hour   day of month   month   day of week   year
 */
export const convertStringToSchedule = (
  str: ConvertableString
): ThreadTrigger => {
  const curTime = new Date(Date.now());
  const min = curTime.getUTCMinutes();
  const hour = curTime.getUTCHours();
  const dom = curTime.getUTCDate();
  const dow = curTime.getUTCDay();
  const month = curTime.getUTCMonth();

  switch (str) {
    case "Immediate":
      return { now: {} };
    case "Daily":
      return { cron: { scheduleStr: `0 ${min} ${hour} * * * *` } };
    case "Weekly":
      return { cron: { scheduleStr: `0 ${min} ${hour} * * ${dow} *` } };
    case "Monthly":
      return { cron: { scheduleStr: `0 ${min} ${hour} ${dom} * * *` } };
    case "Yearly":
      return { cron: { scheduleStr: `0 ${min} ${hour} ${dom} ${month} * *` } };
    case "TEST":
      return { cron: { scheduleStr: `0 * * * * * *` } };
    default: {
      console.log("Invalid conversion string.");
      throw new Error("Invalid conversion string.");
    }
  }
};

export const serializePaymentType = (
  pt: PaymentType
): SeriaizeablePaymentType => {
  return {
    ...pt,
    threadAuthority: pt.threadAuthority.toBase58(),
    tokenAuthority: pt.tokenAuthority.toBase58(),
    threadKey: pt.threadKey.toBase58(),
    payer: pt.payer.toBase58(),
    receiver: pt.receiver.toBase58(),
    mint: pt.mint.toBase58(),
    amount: pt.amount.toNumber(),
  };
};

export const deserializePaymentType = (
  pt: SeriaizeablePaymentType
): PaymentType => {
  return {
    ...pt,
    threadAuthority: new PublicKey(pt.threadAuthority),
    tokenAuthority: new PublicKey(pt.tokenAuthority),
    threadKey: new PublicKey(pt.threadKey),
    payer: new PublicKey(pt.payer),
    receiver: new PublicKey(pt.receiver),
    mint: new PublicKey(pt.mint),
    amount: new BN(pt.amount),
  };
};
