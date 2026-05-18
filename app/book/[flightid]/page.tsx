import { createClient } from "@/app/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatDate } from "@/app/lib/utils/flights";
import SeatMap from "./SeatMap";

// Next.js passes route params and search params as props to page components
interface Props {
  params: Promise<{ flightId: string }>;
  searchParams: Promise<{ cabin?: string; passengers?: string }>;
}

export default async function BookFlightPage({ params, searchParams }: Props) {
  // In Next.js 15, params and searchParams are Promises — we await them
  const { flightId } = await params;
  const { cabin = "economy", passengers = "1" } = await searchParams;

  const supabase = await createClient();

  // Fetch the specific flight by its UUID, with joined airport data
  const { data: flight, error } = await supabase
    .from("flights")
    .select(
      `
      *,
      origin_airport:origin ( iata, name, city ),
      destination_airport:destination ( iata, name, city )
    `,
    )
    .eq("id", flightId)
    .single();

  // notFound() is a Next.js helper that renders the nearest not-found.tsx
  // or a default 404 page. Much cleaner than a conditional render.
  if (error || !flight) notFound();

  const multiplier =
    ({ economy: 1, business: 2.2, first: 3.5 } as Record<string, number>)[
      cabin
    ] ?? 1;
  const price = Math.round(flight.base_price * multiplier);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-sand)",
        paddingTop: "40px",
        paddingBottom: "60px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        {/* Back link */}
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--color-driftwood)",
            fontFamily: "var(--font-body)",
            textDecoration: "none",
            marginBottom: "24px",
          }}
        >
          ← Back to search
        </a>

        {/* Flight summary header */}
        <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
          <p
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-driftwood)",
              fontFamily: "var(--font-body)",
              marginBottom: "8px",
            }}
          >
            {flight.flight_number} · {formatDate(flight.departs_at)} ·{" "}
            {cabin.charAt(0).toUpperCase() + cabin.slice(1)}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div>
              <div
                style={{
                  fontSize: "36px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  color: "var(--color-ocean)",
                }}
              >
                {flight.origin_airport?.city ?? flight.origin}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--color-driftwood)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {flight.origin}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: "var(--color-driftwood)",
              }}
            >
              ✈
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "36px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  color: "var(--color-ocean)",
                }}
              >
                {flight.destination_airport?.city ?? flight.destination}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--color-driftwood)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {flight.destination}
              </div>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator step={1} />

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "28px",
            fontWeight: 400,
            color: "var(--color-ocean)",
            margin: "24px 0 8px",
          }}
        >
          Choose your seat
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--color-driftwood)",
            marginBottom: "24px",
          }}
        >
          Select a seat from the map below. Gray seats are already taken.
        </p>

        {/*
          SeatMap is a Client Component — it handles click interactions.
          We pass it the data it needs as props. This is the correct boundary:
          server component fetches, client component interacts.
        */}
        <SeatMap
          flightId={flightId}
          cabin={cabin}
          passengers={parseInt(passengers)}
          seatsBooked={flight.seats_booked}
          seatsTotal={flight.seats_total}
          pricePerSeat={price}
        />
      </div>
    </main>
  );
}

// Progress indicator component — shows which step of the booking the user is on
function StepIndicator({ step }: { step: number }) {
  const steps = ["Select Seat", "Your Details", "Confirmation"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === step;
        const done = num < step;
        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < steps.length - 1 ? 1 : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  flexShrink: 0,
                  background: done
                    ? "var(--color-lagoon)"
                    : active
                      ? "var(--color-ocean)"
                      : "#E0D9D0",
                  color: done || active ? "white" : "var(--color-driftwood)",
                }}
              >
                {done ? "✓" : num}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-body)",
                  color: active
                    ? "var(--color-ocean)"
                    : "var(--color-driftwood)",
                  fontWeight: active ? 500 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: done ? "var(--color-lagoon)" : "#E0D9D0",
                  margin: "0 12px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
