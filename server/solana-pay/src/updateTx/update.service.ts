import { BN } from "@coral-xyz/anchor";
import { Injectable } from "@nestjs/common";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  convertStringToSchedule,
  updatePaymentIx,
  UpdateRequestParams,
} from "@solutio/sdk";
import { SolutioInstructionService, SpPostReturnType } from "../utils/types";

@Injectable()
export class UpdateService extends SolutioInstructionService {
  constructor() {
    super();
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
        newSchedule: newSchedule ? convertStringToSchedule(newSchedule) : null,
      })
    );

    const b64Tx = await this.getSerializedTransaction(ixs);

    return {
      transaction: b64Tx,
      messgae: "", // Say something
    };
  }
}
