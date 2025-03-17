/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * AI Agent API
 * The AI Agent API description
 * OpenAPI spec version: 1.0
 */
import type { AccommodationDto } from './accommodationDto';
import type { TransportationDto } from './transportationDto';
import type { ActivityDto } from './activityDto';

export interface TripDayDto {
  /** Title of the day plan */
  title: string;
  /** Date of the day plan */
  date: string;
  accommodation: AccommodationDto;
  transportation?: TransportationDto;
  activities: ActivityDto[];
}
