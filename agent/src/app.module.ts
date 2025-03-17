import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentModule } from './agent/agent.module';
import { DatabaseService } from './db/database.service';
import { TripAgentModule } from './trip-agent/trip-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AgentModule,
    TripAgentModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
