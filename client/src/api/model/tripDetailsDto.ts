/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * AI Agent API
 * The AI Agent API description
 * OpenAPI spec version: 1.0
 */
import type { TripDayDto } from './tripDayDto';

export interface TripDetailsDto {
  /** Destination of the trip */
  destination: string;
  /** Start date of the trip */
  startDate: string;
  /** End date of the trip */
  endDate: string;
  /** Tags describing the trip */
  tags: string[];
  days: TripDayDto[];
}
