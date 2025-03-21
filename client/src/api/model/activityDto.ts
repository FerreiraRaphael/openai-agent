/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * AI Agent API
 * The AI Agent API description
 * OpenAPI spec version: 1.0
 */
import type { ActivityDtoType } from './activityDtoType';

export interface ActivityDto {
  /** Name of the activity */
  name: string;
  /** Type of activity */
  type: ActivityDtoType;
  /** Time of the activity */
  time: string;
  /** Duration of the activity */
  duration?: string;
  /** Location of the activity */
  location?: string;
  /** Description of the activity */
  description?: string;
  /** Price of the activity */
  price: string;
}
