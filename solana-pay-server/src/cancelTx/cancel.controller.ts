import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { CancelRequestParams, CancelService } from "./cancel.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

@Controller("cancel")
export class CancelController {
  constructor(private readonly appService: CancelService) {}

  @Get()
  async get(): Promise<SpGetReturnType> {
    return this.appService.handleGet();
  }

  @Post()
  async post(@Body() body: CancelRequestParams): Promise<SpPostReturnType> {
    return await this.appService.handlePost(body);
  }
}
