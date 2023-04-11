import { Program, Provider, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Injectable } from "@nestjs/common";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  getSolutioProgram,
  serializeTransactionToBase64,
  updatePaymentIx,
} from "@solutio/sdk";
import {
  ICON_URI,
  SolutioRequestParams,
  SpGetReturnType,
  SpPostReturnType,
} from "../utils/types";

const LABEL: string = "Updating Payment";

export interface UpdateRequestParams extends SolutioRequestParams {
  threadId: number;
  newAmount: number | null;
  newSchedule: string | null;
}

export interface UpdateRequestParams extends SolutioRequestParams {
  threadId: number;
  newAmount: number | null;
  newSchedule: string | null;
}

@Injectable()
export class UpdateService {
  private provider: Provider;
  private program: Program;

  constructor() {
    this.provider = AnchorProvider.env();
    this.program = getSolutioProgram(this.provider);
  }

  handleGet(): SpGetReturnType {
    return {
      icon: ICON_URI,
      label: LABEL,
    };
  }

  async handlePost({
    taOwner,
    receiver,
    mint,
    threadId,
    newAmount,
    newSchedule,
  }: UpdateRequestParams): Promise<SpPostReturnType> {
    const ixs: TransactionInstruction[] = [];

    const taOwnerKey = new PublicKey(taOwner);
    const receiverKey = new PublicKey(receiver);
    const mintKey = new PublicKey(mint);

    ixs.push(
      await updatePaymentIx({
        taOwner: taOwnerKey,
        receiver: receiverKey,
        mint: mintKey,
        threadId,
        program: this.program,
        newAmount: newAmount ? new BN(newAmount) : null,
        newSchedule: null, // process newSchedule then replace
      })
    );

    const b64Tx = serializeTransactionToBase64(ixs);

    return {
      transaction: b64Tx,
      messgae: "", // Say something
    };
  }
}
