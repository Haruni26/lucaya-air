import BookingCard from "@/app/components/booking-card";

export default function HomePage() {
  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[85vh] px-4 pt-24 pb-32 text-center overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, var(--color-ocean) 0%, #1a4a6e 60%, #0e7c86 100%)",
        }}
      >
        {/* Decorative background circles */}
        <div
          className="absolute -top-20 -right-20 w-100 h-100 rounded-full opacity-10"
          style={{ background: "var(--color-reef)" }}
        />
        <div
          className="absolute -bottom-15 -left-15 w-75 h-75 rounded-full opacity-10"
          style={{ background: "var(--color-gold)" }}
        />

        {/* Airline name */}
        <p
          className="text-sm font-medium tracking-[0.3em] uppercase mb-4 opacity-70"
          style={{ color: "var(--color-reef)", fontFamily: "var(--font-body)" }}
        >
          Welcome to
        </p>
        <h1
          className="text-7xl md:text-8xl font-light mb-4 animate-fade-up"
          style={{ color: "white", fontFamily: "var(--font-display)" }}
        >
          Lucaya Air
        </h1>
        <p
          className="text-lg md:text-xl mb-16 max-w-md opacity-80 animate-fade-up"
          style={{
            color: "white",
            fontFamily: "var(--font-body)",
            fontWeight: 300,
          }}
        >
          Your gateway to the Caribbean — Nassau, the Exumas, and beyond.
        </p>

        {/* Booking Card */}
        <div className="w-full max-w-3xl animate-fade-up">
          <BookingCard />
        </div>
      </section>

      {/* Destinations teaser */}
      <section
        className="py-32 px-4"
        style={{ background: "var(--color-sand)" }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className="text-5xl font-light mb-4"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-ocean)",
            }}
          >
            Where will you go?
          </h2>
          <p
            className="text-base max-w-md mx-auto mb-12"
            style={{
              color: "var(--color-driftwood)",
              fontFamily: "var(--font-body)",
            }}
          >
            Direct routes across the Bahamas and beyond — island hopping made
            simple.
          </p>

          {/* Destination cards — static for now, can be fetched from Supabase later */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DESTINATIONS.map((dest) => (
              <div
                key={dest.iata}
                className="card p-6 text-left transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div
                  className="text-3xl mb-1 font-bold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-lagoon)",
                  }}
                >
                  {dest.iata}
                </div>
                <div
                  className="text-lg font-medium mb-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-ocean)",
                  }}
                >
                  {dest.city}
                </div>
                <div
                  className="text-sm"
                  style={{
                    color: "var(--color-driftwood)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {dest.country}
                </div>
                <div
                  className="mt-4 text-sm font-medium"
                  style={{
                    color: "var(--color-coral)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  From ${dest.from_price} USD
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// Static destination data — swap this out for a Supabase fetch later
const DESTINATIONS = [
  {
    iata: "GGT",
    city: "George Town",
    country: "Exuma, Bahamas",
    from_price: 89,
  },
  {
    iata: "MHH",
    city: "Marsh Harbour",
    country: "Abaco, Bahamas",
    from_price: 79,
  },
  {
    iata: "GCM",
    city: "Grand Cayman",
    country: "Cayman Islands",
    from_price: 219,
  },
  {
    iata: "PLS",
    city: "Providenciales",
    country: "Turks & Caicos",
    from_price: 189,
  },
  { iata: "MBJ", city: "Montego Bay", country: "Jamaica", from_price: 179 },
  { iata: "MIA", city: "Miami", country: "Florida, USA", from_price: 129 },
];
