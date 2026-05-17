import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Flight, ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");
  const cabin = searchParams.get("cabin") ?? "economy";

  // Validation
  if (!origin || !destination || !date) {
    return NextRequest.json<ApiResponse<null>>(
      { data: null, error: "origin, destination, and date are required" },
      { status: 400 },
    );
  }

  // Query
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flights")
    .select(
      "*, origin_airport:origin ( iata, name, city ), destination_airport:destination ( iata, name, city )",
    )
    .eq("origin", origin.toUpperCase())
    .gte("departs_at", `${date}T00:00:00Z`)
    .lte("departs_at", `${date}T23:59:59Z`)
    .neq("status", "cancelled")
    .order("departs_at", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return NextRequest.json<ApiResponse<null>>(
      { data: null, error: "Failed to fetch flights" },
      { status: 500 },
    );
  }

  // Filter out fully booked flights
  const available = (data as Flight[]).filter(
    (f) => f.seats_booked < f.seats_total,
  );

  return NextRequest.json<ApiResponse<Flight[]>>({
    data: available,
    error: null,
  });
}
