import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";
import type { Airport } from "@/app/types";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [], error: null });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("airports")
    .select("iata, name, city, country, lat, lng")
    .or(`iata.ilike.%${q}%,city.ilike.%${q}%,name.ilike.%${q}%`)
    .limit(6);

  if (error) {
    return NextResponse.json(
      { data: null, error: "Search failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: data as Airport[], error: null });
}
