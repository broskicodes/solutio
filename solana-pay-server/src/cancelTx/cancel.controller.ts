import { Body, Controller, Get, Header, Post, Query } from "@nestjs/common";
import { CancelService } from "./cancel.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";
import { CancelRequestParams } from "@solutio/sdk";

const LABEL: string = "Cancelling Payment";

@Controller("cancel")
export class CancelController {
  constructor(private readonly appService: CancelService) {}

  @Get()
  // @Header("Content-Encoding", "deflate")
  @Header("Content-Type", "application/json")
  get(): SpGetReturnType {
    return this.appService.handleGet(LABEL);
  }

  @Post()
  // @Header("Content-Encoding", "deflate")
  async post(
    @Query() qps: Omit<CancelRequestParams, "taOwner">,
    @Body("account") account: string
  ): Promise<SpPostReturnType> {
    return await this.appService.handlePost({ ...qps, taOwner: account });
  }
}
