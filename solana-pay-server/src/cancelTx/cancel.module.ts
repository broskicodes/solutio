import { Module } from "@nestjs/common";
import { CancelController } from "./cancel.controller";
import { CancelService } from "./cancel.service";

@Module({
  imports: [],
  controllers: [CancelController],
  providers: [CancelService],
})
export class CancelModule {}
