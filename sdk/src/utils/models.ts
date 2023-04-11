import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

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
  delegateAmount: BN;
}

export interface SetupPaymentParmas extends SolutioIxParams {
  transferAmount: BN;
  threadId: number;
  threadTrigger: ThreadTrigger;
}

export interface UpdatePaymentParams extends SolutioIxParams {
  threadId: number;
  newAmount: BN | null;
  newSchedule: ThreadTrigger | null;
}

export interface CancelPaymentParams extends SolutioIxParams {
  threadId: number;
}
