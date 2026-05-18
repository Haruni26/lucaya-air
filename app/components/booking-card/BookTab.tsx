"use client";

import { useState } from "react";
import type { Flight, CabinClass, TripType } from "@/app/types";
import {
  formatTime,
  formatDate,
  formatDuration,
} from "@/app/lib/utils/flights";
import { formatUSD } from "@/app/lib/utils/currency";

// Types
interface SearchForm {
  tripType: TripType;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  cabin: CabinClass;
}

// Component
export default function BookTab() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<SearchForm>({
    tripType: "roundtrip",
    origin: "",
    destination: "",
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
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  // Generic field updater
  function set<K extends keyof SearchForm>(key: K, value: SearchForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFlights([]);
    setReturnFlights([]);
    setSelectedFlight(null);
    setSearched(false);

    try {
      // Search outbound flights
      const outParams = new URLSearchParams({
        origin: form.origin.toUpperCase().trim(),
        destination: form.destination.toUpperCase().trim(),
        date: form.departDate,
        cabin: form.cabin,
        passengers: String(form.passengers),
      });

      const outRes = await fetch(`/api/flights/search?${outParams}`);
      const outJson = await outRes.json();
      if (!outRes.ok) throw new Error(outJson.error ?? "Search failed");
      setFlights(outJson.data ?? []);

      // If round trip, also search return flights
      if (form.tripType === "roundtrip" && form.returnDate) {
        const retParams = new URLSearchParams({
          origin: form.destination.toUpperCase().trim(),
          destination: form.origin.toUpperCase().trim(),
          date: form.returnDate,
          cabin: form.cabin,
          passengers: String(form.passengers),
        });

        const retRes = await fetch(`/api/flights/search?${retParams}`);
        const retJson = await retRes.json();
        if (retRes.ok) setReturnFlights(retJson.data ?? []);
      }

      setSearched(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Swap origin and destination
  function handleSwap() {
    setForm((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  }

  return (
    <div>
      {/* Trip type pills */}
      <div className="flex gap-2 mb-5">
        {(["roundtrip", "oneway", "multicity"] as TripType[]).map((t) => (
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
            {t === "roundtrip"
              ? "Round Trip"
              : t === "oneway"
                ? "One Way"
                : "Multi-City"}
          </button>
        ))}
      </div>

      {/* Search form  */}
      <form onSubmit={handleSearch}>
        {/* Row 1: Origin / Swap / Destination */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "8px",
            alignItems: "end",
            marginBottom: "12px",
          }}
        >
          <div>
            <label className="field-label">From</label>
            <input
              className="field-input"
              placeholder="e.g. NAS"
              value={form.origin}
              onChange={(e) => set("origin", e.target.value)}
              maxLength={3}
              required
            />
          </div>

          {/* Swap button */}
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
            title="Swap origin and destination"
          >
            ⇄
          </button>

          <div>
            <label className="field-label">To</label>
            <input
              className="field-input"
              placeholder="e.g. MIA"
              value={form.destination}
              onChange={(e) => set("destination", e.target.value)}
              maxLength={3}
              required
            />
          </div>
        </div>

        {/* Row 2: Departure / Return dates */}
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
              value={form.departDate}
              onChange={(e) => set("departDate", e.target.value)}
              min={today}
              required
            />
          </div>

          {form.tripType === "roundtrip" && (
            <div>
              <label className="field-label">Return Date</label>
              <input
                className="field-input"
                type="date"
                value={form.returnDate}
                onChange={(e) => set("returnDate", e.target.value)}
                min={form.departDate || today}
              />
            </div>
          )}
        </div>

        {/* Row 3: Passengers / Cabin */}
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
          {/* Outbound flights */}
          <ResultsSection
            label={
              form.tripType === "roundtrip"
                ? `Outbound · ${form.origin.toUpperCase()} → ${form.destination.toUpperCase()}`
                : undefined
            }
            flights={flights}
            cabin={form.cabin}
            onSelect={setSelectedFlight}
            selectedId={selectedFlight?.id}
          />

          {/* Return flights (round trip only) */}
          {form.tripType === "roundtrip" && (
            <ResultsSection
              label={`Return · ${form.destination.toUpperCase()} → ${form.origin.toUpperCase()}`}
              flights={returnFlights}
              cabin={form.cabin}
              onSelect={() => {}}
              selectedId={undefined}
              style={{ marginTop: "20px" }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Results section
function ResultsSection({
  label,
  flights,
  cabin,
  onSelect,
  selectedId,
  style,
}: {
  label?: string;
  flights: Flight[];
  cabin: CabinClass;
  onSelect: (f: Flight) => void;
  selectedId: string | undefined;
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
          No flights found. Try a different date or route.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              cabin={cabin}
              selected={selectedId === flight.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual flight card
function FlightCard({
  flight,
  cabin,
  selected,
  onSelect,
}: {
  flight: Flight;
  cabin: CabinClass;
  selected: boolean;
  onSelect: (f: Flight) => void;
}) {
  const multiplier = { economy: 1.0, business: 2.2, first: 3.5 }[cabin];
  const price = Math.round(flight.base_price * multiplier);
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
        border: `1.5px solid ${selected ? "var(--color-lagoon)" : "#E0D9D0"}`,
        background: selected ? "rgba(14,124,134,0.04)" : "var(--color-sand)",
        transition: "all 0.15s ease",
        cursor: "pointer",
      }}
      onClick={() => onSelect(flight)}
    >
      {/* Times + route */}
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

      {/* Price + select */}
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
          className={selected ? "btn-ghost" : "btn-primary"}
          style={{ fontSize: "12px", padding: "6px 16px" }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(flight);
          }}
        >
          {selected ? "Selected ✓" : "Select"}
        </button>
      </div>
    </div>
  );
}
