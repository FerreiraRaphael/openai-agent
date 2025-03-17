import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { TripDetails } from '@/types/trip';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// // Define schemas for our tools
// const destinationSchema = z.object({
//   name: z.string().describe("The name of the destination"),
//   country: z.string().describe("The country of the destination"),
//   description: z.string().describe("A brief description of the destination"),
//   bestTimeToVisit: z.string().describe("The best time of year to visit"),
//   popularAttractions: z.array(z.string()).describe("Popular attractions at this destination"),
// })

// const hotelSchema = z.object({
//   name: z.string().describe("The name of the hotel"),
//   address: z.string().describe("The address of the hotel"),
//   priceRange: z.string().describe("The price range of the hotel (e.g., $, $$, $$$)"),
//   amenities: z.array(z.string()).describe("Amenities offered by the hotel"),
//   rating: z.number().min(1).max(5).describe("Rating of the hotel from 1 to 5"),
// })

// const attractionSchema = z.object({
//   name: z.string().describe("The name of the attraction"),
//   location: z.string().describe("The location of the attraction"),
//   description: z.string().describe("A brief description of the attraction"),
//   suggestedDuration: z.string().describe("Suggested duration to spend at the attraction"),
//   price: z.string().optional().describe("Price of admission if applicable"),
// })

// const restaurantSchema = z.object({
//   name: z.string().describe("The name of the restaurant"),
//   location: z.string().describe("The location of the restaurant"),
//   cuisine: z.string().describe("Type of cuisine"),
//   priceRange: z.string().describe("The price range (e.g., $, $$, $$$)"),
//   rating: z.number().min(1).max(5).describe("Rating from 1 to 5"),
// })

const tripPlanSchema = z.object({
  destination: z.string().describe('The main destination of the trip'),
  startDate: z.string().describe('The start date of the trip'),
  endDate: z.string().describe('The end date of the trip'),
  days: z.array(
    z.object({
      title: z.string().describe('Title for this day'),
      date: z.string().describe('Date for this day'),
      accommodation: z
        .object({
          name: z.string().describe('Name of the accommodation'),
          address: z.string().describe('Address of the accommodation'),
        })
        .optional(),
      transportation: z
        .object({
          type: z.string().describe('Type of transportation'),
          details: z.string().describe('Details about the transportation'),
        })
        .optional(),
      activities: z
        .array(
          z.object({
            name: z.string().describe('Name of the activity'),
            type: z.enum(['attraction', 'meal', 'event', 'other']).describe('Type of activity'),
            time: z.string().optional().describe('Time of the activity'),
            location: z.string().optional().describe('Location of the activity'),
            description: z.string().optional().describe('Description of the activity'),
          })
        )
        .optional(),
    })
  ),
  tags: z
    .array(z.string())
    .describe('Tags describing the trip (e.g., "beach", "family", "adventure")'),
});

// Mock data for our tools
const mockDestinations = [
  {
    name: 'Paris',
    country: 'France',
    description: 'The City of Light, known for its art, culture, and cuisine.',
    bestTimeToVisit: 'April to June, September to October',
    popularAttractions: [
      'Eiffel Tower',
      'Louvre Museum',
      'Notre-Dame Cathedral',
      'Montmartre',
      'Seine River Cruise',
    ],
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    description: 'A bustling metropolis that mixes ultramodern and traditional.',
    bestTimeToVisit: 'March to May, September to November',
    popularAttractions: [
      'Tokyo Skytree',
      'Meiji Shrine',
      'Senso-ji Temple',
      'Shibuya Crossing',
      'Tokyo Disneyland',
    ],
  },
  {
    name: 'New York City',
    country: 'United States',
    description: 'The Big Apple, a global center for art, fashion, and finance.',
    bestTimeToVisit: 'April to June, September to November',
    popularAttractions: [
      'Times Square',
      'Central Park',
      'Empire State Building',
      'Statue of Liberty',
      'Broadway',
    ],
  },
];

const mockHotels = {
  Paris: [
    {
      name: 'Hotel de Luxe',
      address: '123 Champs-Élysées, Paris',
      priceRange: '$$$',
      amenities: ['Free WiFi', 'Spa', 'Restaurant', 'Room Service'],
      rating: 4.7,
    },
    {
      name: 'Cozy Parisian Inn',
      address: '45 Rue de Rivoli, Paris',
      priceRange: '$$',
      amenities: ['Free WiFi', 'Breakfast', 'Air Conditioning'],
      rating: 4.2,
    },
  ],
  Tokyo: [
    {
      name: 'Tokyo Luxury Hotel',
      address: '1-1-1 Shinjuku, Tokyo',
      priceRange: '$$$',
      amenities: ['Free WiFi', 'Pool', 'Gym', 'Multiple Restaurants'],
      rating: 4.8,
    },
    {
      name: 'Capsule Stay Tokyo',
      address: '2-3-4 Shibuya, Tokyo',
      priceRange: '$',
      amenities: ['Free WiFi', 'Shared Bathroom', 'Lounge'],
      rating: 3.9,
    },
  ],
  'New York City': [
    {
      name: 'Manhattan Grand Hotel',
      address: '123 Broadway, New York',
      priceRange: '$$$',
      amenities: ['Free WiFi', 'Gym', 'Restaurant', 'Business Center'],
      rating: 4.5,
    },
    {
      name: 'Brooklyn Boutique Hotel',
      address: '456 Park Avenue, Brooklyn',
      priceRange: '$$',
      amenities: ['Free WiFi', 'Breakfast', 'Rooftop Bar'],
      rating: 4.3,
    },
  ],
};

const mockAttractions = {
  Paris: [
    {
      name: 'Eiffel Tower',
      location: 'Champ de Mars, 5 Avenue Anatole France',
      description: 'Iconic iron tower offering city views from observation decks.',
      suggestedDuration: '2-3 hours',
      price: '€26 for adults to the summit',
    },
    {
      name: 'Louvre Museum',
      location: 'Rue de Rivoli, 75001 Paris',
      description: "World's largest art museum and home to the Mona Lisa.",
      suggestedDuration: '3-4 hours',
      price: '€17 for adults',
    },
  ],
  Tokyo: [
    {
      name: 'Tokyo Skytree',
      location: '1 Chome-1-2 Oshiage, Sumida City',
      description: 'Tallest tower in Japan with observation decks and shopping.',
      suggestedDuration: '2 hours',
      price: '¥3,100 for adults',
    },
    {
      name: 'Meiji Shrine',
      location: '1-1 Yoyogikamizonocho, Shibuya City',
      description: 'Shinto shrine dedicated to Emperor Meiji and Empress Shoken.',
      suggestedDuration: '1-2 hours',
      price: 'Free',
    },
  ],
  'New York City': [
    {
      name: 'Empire State Building',
      location: '20 W 34th St, New York',
      description: 'Iconic 102-story skyscraper with observation decks.',
      suggestedDuration: '1-2 hours',
      price: '$42 for adults',
    },
    {
      name: 'Central Park',
      location: 'Manhattan, New York',
      description: 'Urban park spanning 843 acres with various attractions.',
      suggestedDuration: '2-4 hours',
      price: 'Free',
    },
  ],
};

const mockRestaurants = {
  Paris: [
    {
      name: 'Le Petit Bistro',
      location: '123 Rue Saint-Honoré, Paris',
      cuisine: 'French',
      priceRange: '$$$',
      rating: 4.6,
    },
    {
      name: 'Café de Paris',
      location: '45 Avenue des Champs-Élysées, Paris',
      cuisine: 'French Café',
      priceRange: '$$',
      rating: 4.2,
    },
  ],
  Tokyo: [
    {
      name: 'Sushi Mastery',
      location: '1-2-3 Ginza, Tokyo',
      cuisine: 'Japanese, Sushi',
      priceRange: '$$$',
      rating: 4.9,
    },
    {
      name: 'Ramen House',
      location: '4-5-6 Shinjuku, Tokyo',
      cuisine: 'Japanese, Ramen',
      priceRange: '$',
      rating: 4.5,
    },
  ],
  'New York City': [
    {
      name: 'Manhattan Steakhouse',
      location: '789 5th Avenue, New York',
      cuisine: 'American, Steakhouse',
      priceRange: '$$$$',
      rating: 4.7,
    },
    {
      name: 'Brooklyn Pizza',
      location: '101 Bedford Avenue, Brooklyn',
      cuisine: 'Italian, Pizza',
      priceRange: '$',
      rating: 4.4,
    },
  ],
};

// Define our tools
const searchDestinations = tool({
  description: 'Search for information about travel destinations',
  parameters: z.object({
    query: z.string().describe('The destination to search for'),
  }),
  execute: async ({ query }) => {
    // In a real app, this would call an API
    const normalizedQuery = query.toLowerCase();
    const results = mockDestinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(normalizedQuery) ||
        dest.country.toLowerCase().includes(normalizedQuery)
    );

    return results.length > 0 ? results : 'No destinations found matching your query.';
  },
});

const searchHotels = tool({
  description: 'Search for hotels in a specific destination',
  parameters: z.object({
    destination: z.string().describe('The destination to search hotels in'),
  }),
  execute: async ({ destination }) => {
    // In a real app, this would call an API
    const normalizedDest = destination.toLowerCase();
    const destKey = Object.keys(mockHotels).find((key) =>
      key.toLowerCase().includes(normalizedDest)
    );

    return destKey
      ? mockHotels[destKey as keyof typeof mockHotels]
      : 'No hotels found for this destination.';
  },
});

const searchAttractions = tool({
  description: 'Search for attractions in a specific destination',
  parameters: z.object({
    destination: z.string().describe('The destination to search attractions in'),
  }),
  execute: async ({ destination }) => {
    // In a real app, this would call an API
    const normalizedDest = destination.toLowerCase();
    const destKey = Object.keys(mockAttractions).find((key) =>
      key.toLowerCase().includes(normalizedDest)
    );

    return destKey
      ? mockAttractions[destKey as keyof typeof mockAttractions]
      : 'No attractions found for this destination.';
  },
});

const searchRestaurants = tool({
  description: 'Search for restaurants in a specific destination',
  parameters: z.object({
    destination: z.string().describe('The destination to search restaurants in'),
    cuisine: z.string().optional().describe('Type of cuisine to filter by'),
  }),
  execute: async ({ destination, cuisine }) => {
    // In a real app, this would call an API
    const normalizedDest = destination.toLowerCase();
    const destKey = Object.keys(mockRestaurants).find((key) =>
      key.toLowerCase().includes(normalizedDest)
    );

    if (!destKey) return 'No restaurants found for this destination.';

    let results = mockRestaurants[destKey as keyof typeof mockRestaurants];

    if (cuisine) {
      const normalizedCuisine = cuisine.toLowerCase();
      results = results.filter((restaurant) =>
        restaurant.cuisine.toLowerCase().includes(normalizedCuisine)
      );
    }

    return results.length > 0 ? results : 'No restaurants found matching your criteria.';
  },
});

const createTripPlan = tool({
  description: 'Create a detailed trip plan',
  parameters: tripPlanSchema,
  execute: async (tripPlan) => {
    // In a real app, this might save to a database
    return tripPlan;
  },
});

// Main function to process user queries
export async function processTripQuery(
  query: string,
  previousMessages: Message[]
): Promise<{ response: string; tripDetails: TripDetails | null }> {
  let tripDetails: TripDetails | null = null;

  // Format previous messages for the AI
  const formattedMessages = previousMessages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  try {
    const { text } = await generateText({
      model: openai('gpt-4o', {}),
      system: `You are a helpful travel planning assistant. Help users plan trips by providing information about destinations,
      accommodations, attractions, and creating detailed itineraries. Use the available tools to search for information and
      create trip plans. Always be friendly, informative, and helpful.`,
      prompt: `Previous conversation:\n${formattedMessages}\n\nUser's new message: ${query}`,
      maxTokens: 1000,
      tools: {
        searchDestinations,
        searchHotels,
        searchAttractions,
        searchRestaurants,
        createTripPlan,
      },
      // Allow the model to make multiple tool calls to complete the task
      maxSteps: 5,
    });

    // Check if the response contains a trip plan
    const tripPlanMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (tripPlanMatch && tripPlanMatch[1]) {
      try {
        const parsedPlan = JSON.parse(tripPlanMatch[1]);
        if (parsedPlan && parsedPlan.destination && parsedPlan.days) {
          tripDetails = parsedPlan as TripDetails;
        }
      } catch (e) {
        console.error('Failed to parse trip plan JSON:', e);
      }
    }

    // Clean up the response to remove any JSON
    const cleanResponse = text
      .replace(/```json\s*[\s\S]*?\s*```/g, '')
      .replace(
        /I've created a trip plan for you\./g,
        "I've created a trip plan for you. You can see it in the timeline view."
      )
      .trim();

    return {
      response: cleanResponse,
      tripDetails,
    };
  } catch (error) {
    console.error('Error processing trip query:', error);
    return {
      response:
        'I apologize, but I encountered an error while processing your request. Please try again.',
      tripDetails: null,
    };
  }
}

// Helper function to generate a sample trip plan (for testing)
export function generateSampleTripPlan(): TripDetails {
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
