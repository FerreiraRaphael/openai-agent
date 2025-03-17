import type { TripDetails, TripDay } from '@/types/trip';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Home, Car, Utensils, Camera, Clock } from 'lucide-react';

interface TripTimelineProps {
  trip: TripDetails;
}

export function TripTimeline({ trip }: TripTimelineProps) {
  if (!trip || !trip.days || trip.days.length === 0) {
    return (
      <div className="text-center p-8">
        <p>No trip details available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{trip.destination}</h2>
          <div className="flex items-center text-gray-500 mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {trip.startDate} - {trip.endDate}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {trip.tags?.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {trip.days.map((day, dayIndex) => (
          <div key={dayIndex} className="relative">
            {/* Timeline connector */}
            {dayIndex < trip.days.length - 1 && (
              <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200 z-0"></div>
            )}

            <div className="mb-4 flex items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center z-10">
                {dayIndex + 1}
              </div>
              <h3 className="ml-3 text-lg font-semibold">
                Day {dayIndex + 1}: {day.title}
              </h3>
            </div>

            <div className="ml-10 space-y-4">{renderDayActivities(day)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderDayActivities(day: TripDay) {
  return (
    <>
      {day.accommodation && (
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <Home className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium">{day.accommodation.name}</h4>
              <p className="text-sm text-gray-500">{day.accommodation.address}</p>
            </div>
          </div>
        </Card>
      )}

      {day.transportation && (
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <Car className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium">{day.transportation.type}</h4>
              <p className="text-sm text-gray-500">{day.transportation.details}</p>
            </div>
          </div>
        </Card>
      )}

      {day.activities?.map((activity, index) => (
        <Card key={index} className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              {activity.type === 'meal' ? (
                <Utensils className="h-5 w-5 text-amber-500" />
              ) : (
                <Camera className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium">{activity.name}</h4>
                {activity.time && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{activity.time}</span>
                  </div>
                )}
              </div>
              {activity.location && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{activity.location}</span>
                </div>
              )}
              {activity.description && <p className="text-sm mt-1">{activity.description}</p>}
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}
