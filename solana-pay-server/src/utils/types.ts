import { AnchorProvider, Program, Provider } from "@coral-xyz/anchor";
import { TransactionInstruction } from "@solana/web3.js";
import { CancelRequestParams, getSolutioProgram, serializeTransactionToBase64, SetupRequestParams, UpdateRequestParams } from "@solutio/sdk";

export const ICON_URI = "";

export type B64TransactionString = string;

export interface SpGetReturnType {
  label: string;
  icon: string;
}

export interface SpPostReturnType {
  transaction: B64TransactionString;
  messgae?: string;
}

export type AcceptedRequestParams = SetupRequestParams | UpdateRequestParams | CancelRequestParams;

export abstract class SolutioInstructionService {
  protected provider: Provider;
  protected program: Program;

  constructor() {
    this.provider = AnchorProvider.env();
    this.program = getSolutioProgram(this.provider);
  }

  public handleGet(label: string): SpGetReturnType {
    return {
      icon: ICON_URI,
      label: label,
    };
  }

  public abstract handlePost(params: AcceptedRequestParams): Promise<SpPostReturnType>;

  protected async getSerializedTransaction(ixs: TransactionInstruction[]): Promise<string> {
    const { blockhash, lastValidBlockHeight} = await this.provider.connection.getLatestBlockhash();
    return serializeTransactionToBase64(ixs, blockhash, lastValidBlockHeight);
  }
}