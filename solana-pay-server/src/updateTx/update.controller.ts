import { Body, Controller, Get, Header, Post, Query } from "@nestjs/common";
import { UpdateService } from "./update.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";
import { UpdateRequestParams } from "@solutio/sdk";

const LABEL: string = "Updating Payment";

@Controller("update")
export class UpdateController {
  constructor(private readonly appService: UpdateService) {}

  @Get()
  // @Header("Content-Encoding", "deflate")
  get(): SpGetReturnType {
    return this.appService.handleGet(LABEL);
  }

  @Post()
  // @Header("Content-Encoding", "deflate")
  async post(@Query() qps: Omit<UpdateRequestParams, "taOwner">, @Body('account') account: string): Promise<SpPostReturnType> {
    return this.appService.handlePost({ ...qps, taOwner: account });
  }
}
