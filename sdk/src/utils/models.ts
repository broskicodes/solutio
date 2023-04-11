import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

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

export interface SolutioIxParams {
  taOwner: PublicKey;
  receiver: PublicKey;
  mint: PublicKey;
  program: Program;
}

export interface DelegateTransferAuthority extends SolutioIxParams {
  delAmnt: BN;
}

export interface SetupPaymentParmas extends SolutioIxParams {
  amount: BN;
  threadId: number;
  threadTrigger: ThreadTrigger;
}

export interface UpdatePaymentParams extends SolutioIxParams {
  threadId: number;
  newAmount: BN | null;
  newSchedlue: ThreadTrigger | null;
}

export interface CancelPaymentParams extends SolutioIxParams {
  threadId: number;
}
