"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AirportSearch from "@/app/components/ui/airportSearch";
import type { Flight, CabinClass, TripType, Airport } from "@/app/types";
import { formatTime, formatDuration } from "@/app/lib/utils/flights";
import { formatUSD } from "@/app/lib/utils/currency";

interface SearchForm {
  tripType: TripType;
  origin: string; // IATA code
  destination: string; // IATA code
  originLabel: string; // display name for AirportSearch
  destinationLabel: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  cabin: CabinClass;
}

export default function BookTab() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<SearchForm>({
    tripType: "roundtrip",
    origin: "",
    destination: "",
    originLabel: "",
    destinationLabel: "",
    departDate: "",
    returnDate: "",
    passengers: 1,
    cabin: "economy",
  });

  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Generic state updater — K must be a key of SearchForm
  function set<K extends keyof SearchForm>(key: K, value: SearchForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Called when the user picks an airport from the AirportSearch dropdown
  function handleOriginSelect(airport: Airport) {
    setForm((prev) => ({
      ...prev,
      origin: airport.iata,
      originLabel: `${airport.city} (${airport.iata})`,
    }));
  }

  function handleDestinationSelect(airport: Airport) {
    setForm((prev) => ({
      ...prev,
      destination: airport.iata,
      destinationLabel: `${airport.city} (${airport.iata})`,
    }));
  }

  // Swap origin and destination (and their labels)
  function handleSwap() {
    setForm((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
      originLabel: prev.destinationLabel,
      destinationLabel: prev.originLabel,
    }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!form.origin || !form.destination) {
      setError("Please select both origin and destination airports.");
      return;
    }

    setLoading(true);
    setError(null);
    setFlights([]);
    setReturnFlights([]);
    setSearched(false);

    try {
      const outParams = new URLSearchParams({
        origin: form.origin,
        destination: form.destination,
        date: form.departDate,
        cabin: form.cabin,
        passengers: String(form.passengers),
      });

      // PARALLEL FETCH: Promise.all fires both requests at the same time
      // and waits until BOTH are done. Much faster than two sequential awaits.
      // If we only need one (one-way), we still use an array for consistency.
      const requests: Promise<Response>[] = [
        fetch(`/api/flights/search?${outParams}`),
      ];

      if (form.tripType === "roundtrip" && form.returnDate) {
        const retParams = new URLSearchParams({
          origin: form.destination,
          destination: form.origin,
          date: form.returnDate,
          cabin: form.cabin,
          passengers: String(form.passengers),
        });
        requests.push(fetch(`/api/flights/search?${retParams}`));
      }

      const responses = await Promise.all(requests);
      const [outJson, retJson] = await Promise.all(
        responses.map((r) => r.json()),
      );

      if (!responses[0].ok) throw new Error(outJson.error ?? "Search failed");

      setFlights(outJson.data ?? []);
      if (retJson) setReturnFlights(retJson.data ?? []);
      setSearched(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Navigate to the booking page when a flight is selected.
  // We pass the cabin class as a query param so the booking page knows
  // which price to charge without the user having to pick again.
  function handleSelectFlight(flight: Flight) {
    router.push(
      `/book/${flight.id}?cabin=${form.cabin}&passengers=${form.passengers}`,
    );
  }

  return (
    <div>
      {/* Trip type pills */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {(["roundtrip", "oneway"] as TripType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set("tripType", t)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: 500,
              padding: "4px 14px",
              borderRadius: "var(--radius-pill)",
              border: "1.5px solid",
              borderColor:
                form.tripType === t ? "var(--color-ocean)" : "#E0D9D0",
              backgroundColor:
                form.tripType === t ? "var(--color-ocean)" : "transparent",
              color: form.tripType === t ? "white" : "var(--color-driftwood)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {t === "roundtrip" ? "Round Trip" : "One Way"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch}>
        {/* Origin / Swap / Destination */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "8px",
            alignItems: "end",
            marginBottom: "12px",
          }}
        >
          <AirportSearch
            label="From"
            placeholder="City or airport"
            value={form.originLabel}
            onSelect={handleOriginSelect}
          />

          <button
            type="button"
            onClick={handleSwap}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1.5px solid #E0D9D0",
              background: "var(--color-sand)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0,
              marginBottom: "1px",
              transition: "all 0.15s ease",
            }}
            title="Swap airports"
          >
            ⇄
          </button>

          <AirportSearch
            label="To"
            placeholder="City or airport"
            value={form.destinationLabel}
            onSelect={handleDestinationSelect}
          />
        </div>

        {/* Dates */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              form.tripType === "roundtrip" ? "1fr 1fr" : "1fr",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div>
            <label className="field-label">Departure Date</label>
            <input
              className="field-input"
              type="date"
              min={today}
              required
              value={form.departDate}
              onChange={(e) => set("departDate", e.target.value)}
            />
          </div>
          {form.tripType === "roundtrip" && (
            <div>
              <label className="field-label">Return Date</label>
              <input
                className="field-input"
                type="date"
                min={form.departDate || today}
                value={form.returnDate}
                onChange={(e) => set("returnDate", e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Passengers + Cabin */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div>
            <label className="field-label">Passengers</label>
            <select
              className="field-input"
              value={form.passengers}
              onChange={(e) => set("passengers", Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Passenger" : "Passengers"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Cabin Class</label>
            <select
              className="field-input"
              value={form.cabin}
              onChange={(e) => set("cabin", e.target.value as CabinClass)}
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>
        </div>

        {error && (
          <p
            style={{
              color: "var(--color-coral)",
              fontSize: "13px",
              marginBottom: "12px",
              fontFamily: "var(--font-body)",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
          disabled={loading}
        >
          {loading ? "Searching…" : "Search Flights"}
        </button>
      </form>

      {/* Results */}
      {searched && !loading && (
        <div style={{ marginTop: "24px" }}>
          <FlightResults
            label={
              form.tripType === "roundtrip"
                ? `Outbound · ${form.originLabel} → ${form.destinationLabel}`
                : undefined
            }
            flights={flights}
            cabin={form.cabin}
            onSelect={handleSelectFlight}
          />
          {form.tripType === "roundtrip" && (
            <FlightResults
              label={`Return · ${form.destinationLabel} → ${form.originLabel}`}
              flights={returnFlights}
              cabin={form.cabin}
              onSelect={handleSelectFlight}
              style={{ marginTop: "20px" }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FlightResults({
  label,
  flights,
  cabin,
  onSelect,
  style,
}: {
  label?: string;
  flights: Flight[];
  cabin: CabinClass;
  onSelect: (f: Flight) => void;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      {label && (
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-driftwood)",
            fontFamily: "var(--font-body)",
            marginBottom: "10px",
          }}
        >
          {label}
        </p>
      )}
      {flights.length === 0 ? (
        <p
          style={{
            color: "var(--color-driftwood)",
            fontSize: "13px",
            textAlign: "center",
            padding: "20px 0",
            fontFamily: "var(--font-body)",
          }}
        >
          No flights found. Try a different date.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {flights.map((f) => (
            <FlightCard
              key={f.id}
              flight={f}
              cabin={cabin}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FlightCard({
  flight,
  cabin,
  onSelect,
}: {
  flight: Flight;
  cabin: CabinClass;
  onSelect: (f: Flight) => void;
}) {
  const price = Math.round(
    flight.base_price * { economy: 1, business: 2.2, first: 3.5 }[cabin],
  );
  const seatsLeft = flight.seats_total - flight.seats_booked;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: "12px",
        border: "1.5px solid #E0D9D0",
        background: "var(--color-sand)",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              color: "var(--color-ocean)",
              lineHeight: 1,
            }}
          >
            {formatTime(flight.departs_at)}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--color-driftwood)",
              fontFamily: "var(--font-body)",
              marginTop: "2px",
            }}
          >
            {flight.origin}
          </div>
        </div>
        <div style={{ textAlign: "center", minWidth: "64px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "var(--color-driftwood)",
              fontFamily: "var(--font-body)",
              marginBottom: "4px",
            }}
          >
            {formatDuration(flight.duration_min)}
          </div>
          <div
            style={{
              height: "1px",
              background: "#C8C0B4",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                right: "-6px",
                top: "-7px",
                fontSize: "12px",
              }}
            >
              ✈
            </span>
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--color-lagoon)",
              fontFamily: "var(--font-body)",
              marginTop: "4px",
            }}
          >
            {flight.flight_number}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              color: "var(--color-ocean)",
              lineHeight: 1,
            }}
          >
            {formatTime(flight.arrives_at)}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--color-driftwood)",
              fontFamily: "var(--font-body)",
              marginTop: "2px",
            }}
          >
            {flight.destination}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            color: "var(--color-ocean)",
            lineHeight: 1,
          }}
        >
          {formatUSD(price)}
        </div>
        <div
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-body)",
            marginTop: "3px",
            marginBottom: "8px",
          }}
        >
          {seatsLeft <= 5 ? (
            <span style={{ color: "var(--color-coral)" }}>
              {seatsLeft} seats left
            </span>
          ) : (
            <span style={{ color: "var(--color-driftwood)" }}>per person</span>
          )}
        </div>
        <button
          className="btn-primary"
          style={{ fontSize: "12px", padding: "6px 16px" }}
          onClick={() => onSelect(flight)}
        >
          Select →
        </button>
      </div>
    </div>
  );
}
