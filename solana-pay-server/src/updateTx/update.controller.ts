import { Body, Controller, Get, Header, Post, Query } from "@nestjs/common";
import { UpdateRequestParams, UpdateService } from "./update.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

@Controller("update")
export class UpdateController {
  constructor(private readonly appService: UpdateService) {}

  @Get()
  @Header("Content-Encoding", "deflate")
  async get(): Promise<SpGetReturnType> {
    return this.appService.handleGet();
  }

  @Post()
  @Header("Content-Encoding", "deflate")
  async post(@Query() qps: Omit<UpdateRequestParams, "taOwner">, @Body('account') account: string): Promise<SpPostReturnType> {
    return this.appService.handlePost({ ...qps, taOwner: account });
  }
}
