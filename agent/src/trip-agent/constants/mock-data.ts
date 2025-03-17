import { z } from 'zod';

export const mockDestinations = [
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

export const mockHotels = {
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

export const mockAttractions = {
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

export const mockRestaurants = {
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

export const tripPlanSchema = z.object({
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
          }),
        )
        .optional(),
    }),
  ),
  tags: z
    .array(z.string())
    .describe('Tags describing the trip (e.g., "beach", "family", "adventure")'),
});
