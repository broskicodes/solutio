import { Body, Controller, Get, Post } from "@nestjs/common";
import { UpdateRequestParams, UpdateService } from "./update.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

@Controller("update")
export class UpdateController {
  constructor(private readonly appService: UpdateService) {}

  @Get()
  async get(): Promise<SpGetReturnType> {
    return this.appService.handleGet();
  }

  @Post()
  async post(@Body() body: UpdateRequestParams): Promise<SpPostReturnType> {
    return this.appService.handlePost(body);
  }
}
