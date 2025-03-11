import { Module } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { AgentController } from "./agent.controller";
import { DatabaseService } from "../db/database.service";

@Module({
  controllers: [AgentController],
  providers: [AgentService, DatabaseService],
  exports: [AgentService],
})
export class AgentModule {}
