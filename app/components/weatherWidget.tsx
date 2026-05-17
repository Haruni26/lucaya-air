"use client";

import { useState, useEffect } from "react";
import type { WeatherData } from "@/app/api/weather/route";

interface Props {
  lat: number;
  lng: number;
  cityName: string;
}

export default function WeatherWidget({ lat, lng, cityName }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setWeather(json.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load weather");
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [lat, lng]); // re-fetches automatically when coords change

  if (loading) return <p>Loading weather…</p>;
  if (error) return <p>Weather unavailable</p>;
  if (!weather) return null;

  return (
    <div className="card p-4">
      <p className="field-label">{cityName}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "2rem" }}>{weather.icon}</span>
        <div>
          <p
            style={{
              fontSize: "1.5rem",
              fontFamily: "var(--font-display)",
              margin: 0,
            }}
          >
            {weather.temp_c}°C
          </p>
          <p
            style={{
              color: "var(--color-driftwood)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            {weather.description} · {weather.wind_kph} km/h
          </p>
        </div>
      </div>
    </div>
  );
}
