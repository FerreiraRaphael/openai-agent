import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateConversationDto {
  // Empty class as conversations are created without initial data
}

export class ConversationResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the conversation',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'The timestamp when the conversation was created',
    example: '2024-03-11T17:37:36.000Z'
  })
  @IsDateString()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty({
    description: 'The timestamp when the conversation was last updated',
    example: '2024-03-11T17:37:36.000Z'
  })
  @IsDateString()
  @IsNotEmpty()
  updatedAt: string;
}
