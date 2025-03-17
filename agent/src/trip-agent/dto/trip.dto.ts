import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AccommodationDto {
  @ApiProperty({ description: 'Name of the accommodation', example: 'Hotel de Luxe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Address of the accommodation',
    example: '123 Champs-Élysées, Paris',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Check-in time', example: '15:00' })
  @IsString()
  @IsOptional()
  checkIn?: string;

  @ApiProperty({ description: 'Check-out time', example: '11:00' })
  @IsString()
  @IsOptional()
  checkOut?: string;

  @ApiProperty({ description: 'Price of the accommodation', example: '$200 per night' })
  @IsString()
  @IsOptional()
  price?: string;
}

export class TransportationDto {
  @ApiProperty({ description: 'Type of transportation', example: 'Airport Transfer' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Transportation details',
    example: 'Private car from Charles de Gaulle Airport to hotel',
  })
  @IsString()
  @IsNotEmpty()
  details: string;

  @ApiProperty({ description: 'Departure time', example: '10:00 AM' })
  @IsString()
  @IsOptional()
  departureTime?: string;

  @ApiProperty({ description: 'Arrival time', example: '11:00 AM' })
  @IsString()
  @IsOptional()
  arrivalTime?: string;
}

export class ActivityDto {
  @ApiProperty({ description: 'Name of the activity', example: 'Eiffel Tower Visit' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of activity',
    example: 'attraction',
    enum: ['attraction', 'meal', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  type: 'attraction' | 'meal' | 'other';

  @ApiProperty({ description: 'Time of the activity', example: '10:00 AM' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ description: 'Duration of the activity', required: false, example: '2 hours' })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiProperty({
    description: 'Location of the activity',
    required: false,
    example: 'Champ de Mars, 5 Avenue Anatole France',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Description of the activity',
    required: false,
    example: 'Visit the iconic symbol of Paris',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price of the activity', example: '$20' })
  @IsString()
  @IsOptional()
  price?: string;
}

export class TripDayDto {
  @ApiProperty({ description: 'Title of the day plan', example: 'Exploring Iconic Paris' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Date of the day plan', example: '2025-06-16' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ type: AccommodationDto })
  @ValidateNested()
  @Type(() => AccommodationDto)
  accommodation: AccommodationDto;

  @ApiProperty({ type: TransportationDto, required: false })
  @ValidateNested()
  @IsOptional()
  @Type(() => TransportationDto)
  transportation?: TransportationDto;

  @ApiProperty({ type: [ActivityDto] })
  @ValidateNested({ each: true })
  @Type(() => ActivityDto)
  @IsArray()
  @ArrayMinSize(1)
  activities: ActivityDto[];
}

export class TripDetailsDto {
  @ApiProperty({ description: 'Destination of the trip', example: 'Paris, France' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ description: 'Start date of the trip', example: '2025-06-15' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'End date of the trip', example: '2025-06-20' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'Tags describing the trip',
    example: ['romantic', 'culture', 'food'],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ type: [TripDayDto] })
  @ValidateNested({ each: true })
  @Type(() => TripDayDto)
  @IsArray()
  @ArrayMinSize(1)
  days: TripDayDto[];
}

export class TripQueryResponseDto {
  @ApiProperty({ description: "The assistant's response text" })
  @IsString()
  @IsNotEmpty()
  response: string;

  @ApiProperty({ type: TripDetailsDto, required: false, nullable: true })
  @ValidateNested()
  @IsOptional()
  @Type(() => TripDetailsDto)
  tripDetails: TripDetailsDto | null;
}

export class TripQueryRequestDto {
  @ApiProperty({ description: 'Query text' })
  @IsString()
  @IsNotEmpty()
  query: string;
}

export class MessageDto {
  @ApiProperty({
    description: 'Role of the message sender',
    enum: ['user', 'assistant', 'tool'],
  })
  @IsEnum(['user', 'assistant', 'tool'])
  role: 'user' | 'assistant' | 'tool';

  @ApiProperty({ description: 'Content of the message' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Name of the tool (only for tool messages)',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}
