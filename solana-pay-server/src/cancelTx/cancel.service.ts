import { AnchorProvider } from "@coral-xyz/anchor";
import { Program, Provider } from "@coral-xyz/anchor";
import { Injectable } from "@nestjs/common";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  cancelPaymentIx,
  getSolutioProgram,
  serializeTransactionToBase64,
} from "@solutio/sdk";
import {
  SolutioRequestParams,
  SpGetReturnType,
  SpPostReturnType,
} from "../utils/types";

const ICON_URI: string = "";

export interface CancelRequestParams extends SolutioRequestParams {
  threadId: number;
}

@Injectable()
export class CancelService {
  private provider: Provider;
  private program: Program;

  constructor() {
    this.provider = AnchorProvider.env();
    this.program = getSolutioProgram(this.provider);
  }

  handleGet(): SpGetReturnType {
    return {
      icon: ICON_URI,
      label: "",
    };
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

    const b64Tx = serializeTransactionToBase64(ixs);

    return {
      transaction: b64Tx,
      messgae: "", // Say something
    };
  }
}
