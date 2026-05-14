export type CabinClass = "economy" | "business" | "first";
export type TripType = "roundtrip" | "oneway" | "multicity";
export type FlightStatus =
  | "scheduled"
  | "boarding"
  | "departed"
  | "in_flight"
  | "landed"
  | "delayed"
  | "cancelled";
export type BookingStatus = "confirmed" | "cancelled" | "waitlisted";
export type MembershipTier = "blue" | "silver" | "gold" | "platinum";

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Flight {
  id: string;
  flight_number: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  duration_min: number;
  aircraft: string;
  seats_total: number;
  seats_booked: number;
  base_price: number; // cents
  status: FlightStatus;
  origin_airport?: Airport;
  destination_airport?: Airport;
}

export interface Booking {
  id: string;
  confirmation_no: string;
  flight_id: string;
  member_id?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  seat_number: string;
  cabin_class: CabinClass;
  price_paid: number;
  currency: string;
  status: BookingStatus;
  checked_in: boolean;
  checked_in_at?: string;
  gate?: string;
  boarding_group?: string;
  created_at: string;
  flight?: Flight;
}

export interface BoardingPass {
  passenger: {
    name: string;
    seat: string;
    cabin_class: string;
    boarding_group: string;
  };
  flight: {
    number: string;
    origin: Pick<Airport, "iata" | "city" | "name">;
    destination: Pick<Airport, "iata" | "city" | "name">;
    departs_at: string;
    arrives_at: string;
  };
  gate: string;
  boarding_time: string;
  confirmation_no: string;
}

export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  member_number: string;
  tier: MembershipTier;
  miles_balance: number;
  miles_lifetime: number;
  joined_at: string;
}

export interface FlightSearchParams {
  trip_type: TripType;
  origin: string;
  destination: string;
  depart_date: string; // "YYYY-MM-DD"
  return_date?: string;
  passengers: number;
  cabin_class: CabinClass;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
