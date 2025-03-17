import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { eq } from 'drizzle-orm';
import { conversations, messages, tripPlans } from '../db/schema';
import { DrizzleError } from 'drizzle-orm/errors';
import { generateText, CoreMessage, CoreToolMessage, ToolContent } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { TripQueryResponseDto, TripDetailsDto } from './dto/trip.dto';
import { tripPlanSchema } from './constants/mock-data';
import { tool } from 'ai';
import {
  mockDestinations,
  mockHotels,
  mockAttractions,
  mockRestaurants,
} from './constants/mock-data';

@Injectable()
export class TripAgentService {
  private readonly logger = new Logger(TripAgentService.name);

  constructor(private readonly db: DatabaseService) {}

  private readonly searchDestinations = tool({
    description: 'Search for information about travel destinations',
    parameters: z.object({
      query: z.string().describe('The destination to search for'),
    }),
    execute: async ({ query }) => {
      console.log('searchDestinations query', query);
      const normalizedQuery = query.toLowerCase();
      const results = mockDestinations.filter(
        dest =>
          dest.name.toLowerCase().includes(normalizedQuery) ||
          dest.country.toLowerCase().includes(normalizedQuery),
      );
      return results.length > 0 ? results : 'No destinations found matching your query.';
    },
  });

  private readonly searchHotels = tool({
    description: 'Search for hotels in a specific destination',
    parameters: z.object({
      destination: z.string().describe('The destination to search hotels in'),
    }),
    execute: async ({ destination }) => {
      console.log('searchHotels destination', destination);
      const normalizedDest = destination.toLowerCase();
      const destKey = Object.keys(mockHotels).find(key =>
        key.toLowerCase().includes(normalizedDest),
      );
      return destKey
        ? mockHotels[destKey as keyof typeof mockHotels]
        : 'No hotels found for this destination.';
    },
  });

  private readonly searchAttractions = tool({
    description: 'Search for attractions in a specific destination',
    parameters: z.object({
      destination: z.string().describe('The destination to search attractions in'),
    }),
    execute: async ({ destination }) => {
      console.log('searchAttractions destination', destination);
      const normalizedDest = destination.toLowerCase();
      const destKey = Object.keys(mockAttractions).find(key =>
        key.toLowerCase().includes(normalizedDest),
      );
      return destKey
        ? mockAttractions[destKey as keyof typeof mockAttractions]
        : 'No attractions found for this destination.';
    },
  });

  private readonly searchRestaurants = tool({
    description: 'Search for restaurants in a specific destination',
    parameters: z.object({
      destination: z.string().describe('The destination to search restaurants in'),
      cuisine: z.string().optional().describe('Type of cuisine to filter by'),
    }),
    execute: async ({ destination, cuisine }) => {
      console.log('searchRestaurants destination', destination);
      console.log('searchRestaurants cuisine', cuisine);
      const normalizedDest = destination.toLowerCase();
      const destKey = Object.keys(mockRestaurants).find(key =>
        key.toLowerCase().includes(normalizedDest),
      );

      if (!destKey) return 'No restaurants found for this destination.';

      let results = mockRestaurants[destKey as keyof typeof mockRestaurants];

      if (cuisine) {
        const normalizedCuisine = cuisine.toLowerCase();
        results = results.filter(restaurant =>
          restaurant.cuisine.toLowerCase().includes(normalizedCuisine),
        );
      }

      return results.length > 0 ? results : 'No restaurants found matching your criteria.';
    },
  });

  private readonly createTripPlan = tool({
    description: 'Create a detailed trip plan',
    parameters: tripPlanSchema,
    execute: async tripPlan => {
      console.log('tripPlan', tripPlan);
      return tripPlan;
    },
  });

  private readonly showTripPlan = tool({
    description:
      'Show a trip plan to the user, as the user interacts with the agent, you should show the trip plan to the user',
    parameters: tripPlanSchema,
    execute: async tripPlan => {
      console.log('Showing trip plan', tripPlan);
      try {
        const db = this.db.getDb();
        const existingTripPlan = await db
          .select()
          .from(tripPlans)
          .where(eq(tripPlans.conversationId, this.currentConversationId));
        if (existingTripPlan.length > 0) {
          const result = await db
            .update(tripPlans)
            .set({
              days: JSON.stringify(tripPlan.days),
              destination: tripPlan.destination,
              startDate: tripPlan.startDate,
              endDate: tripPlan.endDate,
              tags: JSON.stringify(tripPlan.tags),
            })
            .where(eq(tripPlans.id, existingTripPlan[0].id))
            .returning();
          console.log('Trip plan updated successfully', result);
          return {
            success: true,
            message: 'Trip plan updated successfully',
            tripPlanId: result[0].id,
          };
        } else {
          const result = await db
            .insert(tripPlans)
            .values({
              conversationId: this.currentConversationId,
              destination: tripPlan.destination,
              startDate: tripPlan.startDate,
              endDate: tripPlan.endDate,
              tags: JSON.stringify(tripPlan.tags),
              days: JSON.stringify(tripPlan.days),
            })
            .returning();
          console.log('Trip plan saved successfully', result);
          return {
            success: true,
            message: 'Trip plan saved successfully',
            tripPlanId: result[0].id,
          };
        }
      } catch (error) {
        console.error('Failed to save trip plan:', error);
        return {
          success: false,
          message: 'Failed to save trip plan',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  });

  private currentConversationId: number = 0;

  async createConversation() {
    const db = this.db.getDb();
    const result = await db.insert(conversations).values({}).returning();
    return result[0];
  }

  async addMessage(
    conversationId: number,
    role: 'user' | 'assistant' | 'tool',
    content: string,
    name?: string,
  ) {
    const db = this.db.getDb();
    return db.insert(messages).values({
      conversationId,
      role,
      content,
      name,
    });
  }

  async getConversationMessages(conversationId: number) {
    try {
      const db = this.db.getDb();
      const result = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);
      return result;
    } catch (error) {
      if (error instanceof DrizzleError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw error;
    }
  }

  async processTripQuery(query: string, conversationId: number): Promise<TripQueryResponseDto> {
    this.currentConversationId = conversationId;

    try {
      // Store the user's message
      await this.addMessage(conversationId, 'user', query);

      // Fetch previous messages from the database
      const previousMessages = await this.getConversationMessages(conversationId);

      // Format messages for the AI model
      const formattedMessages = previousMessages
        .filter(msg => msg.role && msg.content)
        .map(msg => {
          switch (msg.role) {
            case 'tool':
              try {
                // Parse the JSON content for tool messages
                const parsedContent = JSON.parse(msg.content || '');
                return {
                  role: 'tool',
                  content: parsedContent,
                  name: msg.name || '',
                } as CoreToolMessage;
              } catch (e) {
                // If JSON parsing fails, use content as is
                return {
                  role: 'tool',
                  content: msg.content as unknown as ToolContent,
                  name: msg.name || '',
                } as CoreToolMessage;
              }
            case 'user':
            case 'assistant':
              return {
                role: msg.role,
                content: msg.content,
              } as CoreMessage;
            default:
              return null;
          }
        })
        .filter(Boolean) as (CoreMessage | CoreToolMessage)[];

      console.log('formattedMessages', formattedMessages);

      const { text, toolResults, toolCalls } = await generateText({
        model: openai('gpt-4'),
        system: `You are a helpful travel planning assistant. Your primary goal is to help users plan their trips and maintain an updated trip plan throughout the conversation.

IMPORTANT INSTRUCTIONS:
1. ALWAYS provide a text response to the user, even after using tools.
2. As users share their preferences or make decisions, continuously update and show the trip plan using the showTripPlan tool.
3. Start creating a basic trip plan as soon as a destination is mentioned.
4. When users mention dates, activities, or preferences, immediately update the trip plan to reflect these changes.
5. After using showTripPlan, ALWAYS respond with:
   - A summary of what was updated or saved
   - Specific follow-up questions to gather more details
   - Suggestions based on the current information

REQUIRED FOLLOW-UP TOPICS:
- Accommodation preferences (luxury, mid-range, budget)
- Must-see attractions and activities
- Dining preferences and cuisine interests
- Transportation preferences
- Special interests or requirements
- Budget considerations

Remember to:
- Use searchDestinations to find information about places
- Use searchHotels to find accommodation options
- Use searchAttractions to discover local attractions
- Use searchRestaurants to find dining options
- Use showTripPlan to structure the trip details or after any updates
- ALWAYS provide a text response with follow-up questions

NEVER leave the user without a response or follow-up questions.`,
        messages: formattedMessages,
        maxTokens: 1000,
        tools: {
          searchDestinations: this.searchDestinations,
          searchHotels: this.searchHotels,
          searchAttractions: this.searchAttractions,
          searchRestaurants: this.searchRestaurants,
          showTripPlan: this.showTripPlan,
        },
        maxSteps: 5,
      });
      console.log('toolCalls', toolCalls);
      console.log('toolResults', toolResults);

      // Store tool calls if any occurred
      if (toolResults) {
        for (const call of toolResults) {
          await this.addMessage(conversationId, 'tool', JSON.stringify(call.result), call.toolName);
        }
      }

      // Store the assistant's response
      await this.addMessage(conversationId, 'assistant', text);

      return this.processAIResponse(text);
    } catch (error) {
      this.logger.error('Error processing trip query:', error);
      return {
        response:
          'I apologize, but I encountered an error while processing your request. Please try again.',
        tripDetails: null,
      };
    }
  }

  private processAIResponse(text: string): TripQueryResponseDto {
    let tripDetails: TripDetailsDto | null = null;

    const tripPlanMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (tripPlanMatch && tripPlanMatch[1]) {
      try {
        const parsedPlan = JSON.parse(tripPlanMatch[1]);
        if (parsedPlan && parsedPlan.destination && parsedPlan.days) {
          tripDetails = parsedPlan as TripDetailsDto;
        }
      } catch (e) {
        this.logger.error('Failed to parse trip plan JSON:', e);
      }
    }

    const cleanResponse = text
      .replace(/```json\s*[\s\S]*?\s*```/g, '')
      .replace(
        /I've created a trip plan for you\./g,
        "I've created a trip plan for you. You can see it in the timeline view.",
      )
      .replace(/\n\s*\n/g, '\n')
      .trim();

    return {
      response: cleanResponse,
      tripDetails,
    };
  }

  generateSampleTripPlan(): TripDetailsDto {
    return {
      destination: 'Paris, France',
      startDate: '2025-06-15',
      endDate: '2025-06-20',
      tags: ['romantic', 'culture', 'food'],
      days: [
        {
          title: 'Arrival and Settling In',
          date: '2025-06-15',
          accommodation: {
            name: 'Hotel de Luxe',
            address: '123 Champs-Élysées, Paris',
          },
          transportation: {
            type: 'Airport Transfer',
            details: 'Private car from Charles de Gaulle Airport to hotel',
          },
          activities: [
            {
              name: 'Check-in and Rest',
              type: 'other',
              time: '3:00 PM',
              location: 'Hotel de Luxe',
            },
            {
              name: 'Welcome Dinner',
              type: 'meal',
              time: '7:00 PM',
              location: 'Le Petit Bistro',
              description: 'Traditional French cuisine in a cozy setting',
            },
          ],
        },
        {
          title: 'Exploring Iconic Paris',
          date: '2025-06-16',
          accommodation: {
            name: 'Hotel de Luxe',
            address: '123 Champs-Élysées, Paris',
          },
          activities: [
            {
              name: 'Eiffel Tower Visit',
              type: 'attraction',
              time: '10:00 AM',
              duration: '2 hours',
              location: 'Champ de Mars, 5 Avenue Anatole France',
              description: 'Visit the iconic symbol of Paris with skip-the-line tickets',
            },
            {
              name: 'Lunch at Café de Paris',
              type: 'meal',
              time: '1:00 PM',
              location: '45 Avenue des Champs-Élysées',
            },
            {
              name: 'Louvre Museum',
              type: 'attraction',
              time: '3:00 PM',
              duration: '3 hours',
              location: 'Rue de Rivoli, 75001 Paris',
              description: "Explore one of the world's largest art museums",
            },
          ],
        },
        {
          title: 'Day Trip to Versailles',
          date: '2025-06-17',
          accommodation: {
            name: 'Hotel de Luxe',
            address: '123 Champs-Élysées, Paris',
          },
          transportation: {
            type: 'Train',
            details: 'RER C from Paris to Versailles',
          },
          activities: [
            {
              name: 'Palace of Versailles',
              type: 'attraction',
              time: '10:00 AM',
              duration: '4 hours',
              location: "Place d'Armes, 78000 Versailles",
              description: 'Tour the magnificent palace and gardens',
            },
            {
              name: 'Lunch at La Flottille',
              type: 'meal',
              time: '2:00 PM',
              location: 'Gardens of Versailles',
            },
            {
              name: 'Return to Paris',
              type: 'other',
              time: '5:00 PM',
            },
          ],
        },
      ],
    };
  }

  async getTripPlans(conversationId: number) {
    try {
      const db = this.db.getDb();
      const result = await db
        .select()
        .from(tripPlans)
        .where(eq(tripPlans.conversationId, conversationId))
        .orderBy(tripPlans.createdAt);

      return result.map(plan => ({
        ...plan,
        tags: JSON.parse(plan.tags),
        days: JSON.parse(plan.days),
      }));
    } catch (error) {
      this.logger.error('Failed to get trip plans:', error);
      throw error;
    }
  }
}
