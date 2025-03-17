import { useState } from 'react';
import { TripTimeline } from '@/components/trip-timeline';
import { ChatInterface } from '@/components/chat-interface';
import type { TripDetails } from '@/types/trip';
import { Calendar, Luggage, MapPin } from 'lucide-react';

export default function Root() {
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Luggage className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-gray-900">TripPlanner AI</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-primary flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Destinations</span>
            </a>
            <a href="#" className="text-gray-600 hover:text-primary flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>My Trips</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Plan Your Dream Trip</h2>
            <p className="text-gray-600">
              Chat with our AI assistant to plan your perfect trip. Ask about destinations, hotels,
              attractions, and more. The assistant will help you create a personalized itinerary.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm flex-1">
            <ChatInterface onTripUpdate={setTripDetails} />
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Your Trip Timeline</h2>
          {tripDetails ? (
            <TripTimeline trip={tripDetails} />
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trip planned yet</h3>
              <p className="text-gray-500 max-w-md">
                Start chatting with the AI assistant to plan your trip. Your itinerary will appear
                here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
