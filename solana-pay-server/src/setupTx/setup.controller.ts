import { Body, Controller, Get, Header, Post, Query } from "@nestjs/common";
import { SetupRequestParams, SetupService } from "./setup.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

@Controller("setup")
export class SetupController {
  constructor(private readonly appService: SetupService) {}

  @Get()
  @Header("Content-Encoding", "deflate")
  async get(): Promise<SpGetReturnType> {
    return this.appService.handleGet();
  }

  @Post()
  @Header("Content-Encoding", "deflate")
  async post(
    @Query() qps: Omit<SetupRequestParams, "taOwner">,
    @Body("account") account: string
  ): Promise<SpPostReturnType> {
    return await this.appService.handlePost({ ...qps, taOwner: account });
  }
}
