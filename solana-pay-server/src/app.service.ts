import { AnchorProvider } from "@coral-xyz/anchor";
import { Program, Provider } from "@coral-xyz/anchor";
import { Injectable } from "@nestjs/common";
import { getSolutioProgram } from "@solutio/sdk";
import { SpGetReturnType, SpPostReturnType } from "./utils/types";

const ICON_URI: string = "";

@Injectable()
export class AppService {}
