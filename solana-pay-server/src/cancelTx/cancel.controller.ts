import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { CancelService } from "./cancel.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

@Controller("cancel")
export class CancelController {
  constructor(private readonly appService: CancelService) {}

  @Get()
  async get(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<SpGetReturnType> {
    return this.appService.handleGet();
  }

  @Post()
  async post(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<SpPostReturnType> {}
}
