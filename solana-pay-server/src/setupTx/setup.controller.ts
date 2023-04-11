import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { SetupService } from "./setup.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

@Controller("setup")
export class SetupController {
  constructor(private readonly appService: SetupService) {}

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
