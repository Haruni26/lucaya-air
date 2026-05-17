import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import type { Booking, ApiResponse } from "@/app/types";

// Look up a booking
export async function GET(req: NextRequest) {
  const confirmation = req.nextUrl.searchParams.get("confirmation");
  const email = req.nextUrl.searchParams.get("email");

  if (!confirmation || !email) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "confirmation and email are required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "*, flight:flight_id(*, origin_airport:origin(*), destination_airport:destination(*))",
    )
    .eq("confirmation_no", confirmation.toUpperCase())
    .eq("email", email.toLowerCase())
    .single();

  if (error || !data) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Booking not found" },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse<Booking>>({ data, error: null });
}

// Create a new booking (Post)
export async function POST(req: NextRequest) {
  const {
    flight_id,
    first_name,
    last_name,
    email,
    cabin_class = "economy", // default value if not provided
  }: {
    flight_id: string;
    first_name: string;
    last_name: string;
    email: string;
    cabin_class?: "economy" | "business" | "first";
  } = await req.json();

  if (!flight_id || !first_name || !last_name || !email) {
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: "flight_id, first_name, last_name, email are required",
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // Fetch the flight, check availability and compute price
  const { data: flight } = await supabase
    .from("flights")
    .select("*")
    .eq("id", flight_id)
    .single();

  if (!flight) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Flight not found" },
      { status: 404 },
    );
  }

  if (flight.seats_booked >= flight.seats_total) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Flight is fully booked" },
      { status: 409 },
    );
  }

  // Price calculation
  const multiplier = { economy: 1.0, business: 2.2, first: 3.5 }[cabin_class];
  const price_paid = Math.round(flight.base_price * multiplier);

  // Assign seat (simplified — build a seat map UI later)
  const col = ["A", "B", "C", "D", "E", "F"][flight.seats_booked % 6];
  const row =
    Math.ceil((flight.seats_booked + 1) / 6) +
    (cabin_class === "first" ? 0 : cabin_class === "business" ? 3 : 8);
  const seat_number = `${row}${col}`;

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      flight_id,
      first_name,
      last_name,
      email: email.toLowerCase(),
      seat_number,
      cabin_class,
      price_paid,
      currency: "USD",
      status: "confirmed",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to create booking" },
      { status: 500 },
    );
  }

  return NextResponse.json<ApiResponse<Booking>>(
    { data: booking, error: null },
    { status: 201 },
  );
}

// Cancel a booking (Patch)
export async function PATCH(req: NextRequest) {
  const { confirmation_no, email } = await req.json();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("confirmation_no", confirmation_no)
    .eq("email", email.toLowerCase())
    .eq("status", "confirmed") // can't cancel what's already cancelled
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Booking not found or already cancelled" },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse<Booking>>({ data, error: null });
}
