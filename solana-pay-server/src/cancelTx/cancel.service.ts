import { Injectable } from "@nestjs/common";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { cancelPaymentIx, CancelRequestParams } from "@solutio/sdk";
import { SolutioInstructionService, SpPostReturnType } from "../utils/types";

@Injectable()
export class CancelService extends SolutioInstructionService {
  constructor() {
    super();
  }

  async handlePost({
    taOwner,
    receiver,
    mint,
    threadId,
  }: CancelRequestParams): Promise<SpPostReturnType> {
    const ixs: TransactionInstruction[] = [];

    const taOwnerKey = new PublicKey(taOwner);
    const receiverKey = new PublicKey(receiver);
    const mintKey = new PublicKey(mint);

    ixs.push(
      await cancelPaymentIx({
        taOwner: taOwnerKey,
        receiver: receiverKey,
        mint: mintKey,
        threadId,
        program: this.program,
      })
    );

    const b64Tx = await this.getSerializedTransaction(ixs);

    return {
      transaction: b64Tx,
      messgae: "", // Say something
    };
  }
}
