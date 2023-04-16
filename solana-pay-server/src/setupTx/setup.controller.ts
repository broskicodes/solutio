import { Body, Controller, Get, Header, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { SetupService } from "./setup.service";
import { SpGetReturnType, SpPostReturnType } from "../utils/types";
import { SetupRequestParams } from "@solutio/sdk";

const LABEL: string = "Creating New Payment";

@Controller("setup")
export class SetupController {
  constructor(private readonly appService: SetupService) {}

  @Get()
  // @Header("Content-Encoding", "deflate")
  @Header("Access-Control-Allow-Origin", "*")
  get(@Res() res: Response) {
    const v = this.appService.handleGet(LABEL);
    res.json(v);
    
    // return v;
  }

  @Post()
  // @Header("Content-Encoding", "deflate")
  @Header("Access-Control-Allow-Origin", "*")
  async post(
    @Query() qps: Omit<SetupRequestParams, "taOwner">,
    @Body("account") account: any
  ): Promise<SpPostReturnType> {
    return await this.appService.handlePost({ ...qps, taOwner: account });
  }
}
