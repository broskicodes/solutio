import { AnchorProvider } from "@coral-xyz/anchor";
import { Program, Provider } from "@coral-xyz/anchor";
import { Injectable } from "@nestjs/common";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getSolutioProgram, setupPayment } from "@solutio/sdk";
import { BN } from "bn.js";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

const ICON_URI: string = "";

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

  async handlePost(
    taOwner: string,
    receiver: string,
    mint: string,
    amount: number,
    threadSchedule: string,
    delegateAmount?: number
  ): Promise<SpPostReturnType> {
    const tx = new Transaction();

    

    tx.add(await setupPayment(
      {
        taOwner: new PublicKey(taOwner),
        receiver: new PublicKey(receiver),
        mint: new PublicKey(mint),
        amount: new BN(amount),
        threadTrigger: "",
        program: this.program
      }
    ));
  }
}
