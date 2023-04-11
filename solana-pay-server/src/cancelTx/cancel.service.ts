import { AnchorProvider } from "@coral-xyz/anchor";
import { Program, Provider } from "@coral-xyz/anchor";
import { Injectable } from "@nestjs/common";
import { getSolutioProgram } from "@solutio/sdk";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

const ICON_URI: string = "";

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

  async handlePost(): Promise<SpPostReturnType> {}
}
