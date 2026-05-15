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

  // Query
}
