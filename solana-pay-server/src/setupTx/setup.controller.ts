import { Body, Controller, Get, Post } from "@nestjs/common";
import { SetupRequestParams, SetupService } from "./setup.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

@Controller("setup")
export class SetupController {
  constructor(private readonly appService: SetupService) {}

  @Get()
  async get(): Promise<SpGetReturnType> {
    return this.appService.handleGet();
  }

  @Post()
  async post(@Body() body: SetupRequestParams): Promise<SpPostReturnType> {
    return await this.appService.handlePost(body);
  }
}
