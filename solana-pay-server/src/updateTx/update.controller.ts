import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { UpdateService } from "./update.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";

@Controller("update")
export class UpdateController {
  constructor(private readonly appService: UpdateService) {}

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
