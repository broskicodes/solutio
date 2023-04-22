import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CancelModule } from "./cancelTx/cancel.module";
import { SetupModule } from "./setupTx/setup.module";
import { UpdateModule } from "./updateTx/update.module";

@Module({
  imports: [SetupModule, UpdateModule, CancelModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
