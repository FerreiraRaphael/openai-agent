/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * AI Agent API
 * The AI Agent API description
 * OpenAPI spec version: 1.0
 */
import type { TripQueryResponseDtoTripDetails } from './tripQueryResponseDtoTripDetails';

export interface TripQueryResponseDto {
  /** The assistant's response text */
  response: string;
  /** @nullable */
  tripDetails?: TripQueryResponseDtoTripDetails;
}
