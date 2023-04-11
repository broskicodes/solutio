import { Program, Provider, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Injectable } from "@nestjs/common";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  delegateTransferAuthorityIx,
  getNextThreadId,
  getSolutioProgram,
  getThreadAuthorityPDA,
  getTokenAuthPDA,
  serializeTransactionToBase64,
  setupPaymentIx,
} from "@solutio/sdk";
import {
  SolutioRequestParams,
  SpGetReturnType,
  SpPostReturnType,
} from "../utils/types";

const ICON_URI: string = "";

export interface SetupRequestParams extends SolutioRequestParams {
  amount: number;
  threadSchedule: string;
  delegateAmount?: number;
}

@Injectable()
export class SetupService {
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
    amount,
    threadSchedule,
    delegateAmount,
  }: SetupRequestParams): Promise<SpPostReturnType> {
    const ixs: TransactionInstruction[] = [];

    const taOwnerKey = new PublicKey(taOwner);
    const receiverKey = new PublicKey(receiver);
    const mintKey = new PublicKey(mint);

    const userTa = await getAssociatedTokenAddress(mintKey, taOwnerKey);
    const receiverTa = await getAssociatedTokenAddress(mintKey, receiverKey);
    const [tokenAuthKey] = getTokenAuthPDA(taOwnerKey, userTa, receiverTa);
    const tokAuthAcnt = await this.provider.connection.getAccountInfo(
      tokenAuthKey
    );

    if (!tokAuthAcnt) {
      if (!delegateAmount) {
        console.log("Missing delAmnt"); // Return bad http reponse
        return {
          transaction: "",
          messgae: "Transaction failed",
        };
      }

      ixs.push(
        await delegateTransferAuthorityIx({
          taOwner: taOwnerKey,
          receiver: receiverKey,
          mint: mintKey,
          delegateAmount: new BN(delegateAmount),
          program: this.program,
        })
      );
    }

    const [threadAuthKey] = getThreadAuthorityPDA(taOwnerKey);

    const nextThreadId = await getNextThreadId(
      this.provider.connection,
      threadAuthKey
    );

    ixs.push(
      await setupPaymentIx({
        taOwner: taOwnerKey,
        receiver: receiverKey,
        mint: mintKey,
        threadId: nextThreadId,
        transferAmount: new BN(amount),
        threadTrigger: {}, // process threadSchedule and replace
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
