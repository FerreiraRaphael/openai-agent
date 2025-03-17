import { Module } from '@nestjs/common';
import { TripAgentService } from './trip-agent.service';
import { TripAgentController } from './trip-agent.controller';
import { DatabaseService } from 'src/db/database.service';

@Module({
  providers: [TripAgentService, DatabaseService],
  controllers: [TripAgentController],
  exports: [TripAgentService],
})
export class TripAgentModule {}
