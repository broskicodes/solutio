import { Body, Controller, Get, Header, Post, Query } from "@nestjs/common";
import { CancelRequestParams, CancelService } from "./cancel.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

@Controller("cancel")
export class CancelController {
  constructor(private readonly appService: CancelService) {}

  @Get()
  @Header("Content-Encoding", "deflate")
  async get(): Promise<SpGetReturnType> {
    return this.appService.handleGet();
  }

  @Post()
  @Header("Content-Encoding", "deflate")
  async post(
    @Query() qps: Omit<CancelRequestParams, "taOwner">,
    @Body("account") account: string
  ): Promise<SpPostReturnType> {
    return await this.appService.handlePost({ ...qps, taOwner: account });
  }
}
