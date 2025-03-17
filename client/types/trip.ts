export interface TripDetails {
  destination: string
  startDate: string
  endDate: string
  days: TripDay[]
  tags?: string[]
}

export interface TripDay {
  title: string
  date: string
  accommodation?: Accommodation
  transportation?: Transportation
  activities?: Activity[]
}

export interface Accommodation {
  name: string
  address: string
  checkIn?: string
  checkOut?: string
  price?: string
}

export interface Transportation {
  type: string
  details: string
  departureTime?: string
  arrivalTime?: string
}

export interface Activity {
  name: string
  type: "attraction" | "meal" | "event" | "other"
  time?: string
  duration?: string
  location?: string
  description?: string
  price?: string
}

