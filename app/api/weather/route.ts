import { NextRequest, NextResponse } from "next/server";

interface OpenMeteoResponse {
  current: {
    temperature_2m: number; // Celsius
    weathercode: number;
    windspeed_10m: number; //km/h
  };
}

export interface WeatherData {
    temp_c: number;
    description: string;
    wind_kph: number;
    icon: string; // Emojis, need to swap for real ones later
}

export async function GET(req; NextRequest) {
    const lat = req.nextUrl.searchPanrams.get("lat");
    const lng = req.nextUrl.searchParams.get("lng");

    if (!lat || !lng) {
        return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    const url = `https://api.open-meteo.com/v1/forecast`
            + `?latitude=${lat}&longitude=${lng}`
            + `&current=temperature_2m,weathercode,windspeed_10m`
            + `&timezone=auto`;
    
    const res = await fetch(irl);
    const json = await res.json() as OpenMeteoResponse;

    if (!res.ok) {
        return NextResponse.json({ data: null, error: "Weather fetch failed" }, { status: 502});
    }

    const weather = decodeWeatherCode(json.current.weathercode);

    const data: WeatherData = {
        temp_c: Math.round(json.current.temperature_2m),
        description: weather.description,
        wind_kph: Math.round(json.current.windspeed_10m),
        icon: weather.icon,
    };
    return NextResponse.json({ data, error: null });
}

function decodeWeatherCode(code: number): { description: string; icon: string } {
  if (code === 0)              return { description: "Clear sky",       icon: "☀️" };
  if (code <= 2)               return { description: "Partly cloudy",   icon: "⛅" };
  if (code === 3)              return { description: "Overcast",        icon: "☁️" };
  if (code <= 49)              return { description: "Foggy",           icon: "🌫️" };
  if (code <= 59)              return { description: "Drizzle",         icon: "🌦️" };
  if (code <= 69)              return { description: "Rain",            icon: "🌧️" };
  if (code <= 79)              return { description: "Snow",            icon: "❄️" };
  if (code <= 82)              return { description: "Rain showers",    icon: "🌧️" };
  if (code <= 94)              return { description: "Thunderstorm",    icon: "⛈️" };
  return { description: "Severe storm", icon: "🌩️" };
}