import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { Flight, ApiResponse } from "@/app/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // Read query parameters
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");

  // Validation
  if (!origin || !destination || !date) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "origin, destination, and date are required" },
      { status: 400 },
    );
  }

  // Create the Supabase client
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
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to fetch flights" },
      { status: 500 },
    );
  }

  return NextResponse.json<ApiResponse<Flight[]>>({
    data,
    error: null,
  });
}
