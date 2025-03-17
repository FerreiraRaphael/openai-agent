import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TripAgentService } from './trip-agent.service';
import { TripDetailsDto, TripQueryRequestDto, TripQueryResponseDto } from './dto/trip.dto';

@ApiTags('trip-agent')
@Controller('trip-agent')
export class TripAgentController {
  constructor(private readonly tripAgentService: TripAgentService) {}

  @Post('conversations/:id/process-query')
  @ApiOperation({ summary: 'Process a trip planning query in a conversation' })
  @ApiResponse({
    status: 201,
    description: 'The query has been successfully processed',
    type: TripQueryResponseDto,
  })
  async processTripQuery(
    @Param('id') conversationId: string,
    @Body() { query }: TripQueryRequestDto,
  ): Promise<TripQueryResponseDto> {
    return this.tripAgentService.processTripQuery(query, Number(conversationId));
  }

  @Get('sample')
  @ApiOperation({ summary: 'Get a sample trip plan' })
  @ApiResponse({
    status: 200,
    description: 'Returns a sample trip plan',
    type: TripDetailsDto,
  })
  getSampleTripPlan(): TripDetailsDto {
    return this.tripAgentService.generateSampleTripPlan();
  }

  @Get('conversations/:id/trip-plans')
  @ApiOperation({ summary: 'Get all trip plans for a conversation' })
  @ApiResponse({
    status: 200,
    description: 'List of all trip plans in the conversation.',
    type: [TripDetailsDto],
  })
  async getTripPlans(@Param('id') conversationId: string): Promise<TripDetailsDto[]> {
    return this.tripAgentService.getTripPlans(Number(conversationId));
  }
}
