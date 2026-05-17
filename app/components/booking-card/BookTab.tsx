"use client";

import { useState } from "react";
import type { Flight } from "@/app/types";

export default function BookTab() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError(null);

    try {
      // Call API route
      const response = await fetch(
        "/api/flights/search?origin=NAS&destination=MIA&date=2025-08-01",
      );
      // Parse JSON response body
      const json = await response.json();
      // Handle errors
      if (!response.ok) {
        throw new Error(json.error ?? "Something went wrong");
      }
      // Update state with data
      setFlights(json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error has occurred");
    } finally {
      // Always runs whether theres an error or not
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching.." : "Search Flights"}
      </button>

      {/* Condtional rendering message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Map array to JSX */}
      {flights.map((flight) => (
        <div key={flight.id}>
          {flight.flight_number} : {flight.origin} - {flight.destination}
        </div>
      ))}
    </div>
  );
}
