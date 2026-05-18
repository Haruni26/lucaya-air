"use client";

import { useState, useEffect, useRef } from "react";
import type { Airport } from "@/app/types";

interface Props {
  label: string;
  placeholder?: string;
  onSelect: (airport: Airport) => void;
  value?: string; // display value (city name) set by parent after selection
}

export default function AirportSearch({
  label,
  placeholder,
  onSelect,
  value,
}: Props) {
  const [query, setQuery] = useState(value ?? "");
  const [results, setResults] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync the display value if the parent changes it (e.g. swap button)
  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/airports?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.data ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    // Cleanup
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(airport: Airport) {
    // Show the city + IATA in the input so the user knows what they picked
    setQuery(`${airport.city} (${airport.iata})`);
    setOpen(false);
    setResults([]);
    onSelect(airport); // tell the parent which airport was selected
  }

  // Close dropdown when focus leaves the component.
  function handleBlur() {
    setTimeout(() => setOpen(false), 150);
  }

  return (
    <div style={{ position: "relative" }}>
      <label className="field-label">{label}</label>

      <div style={{ position: "relative" }}>
        <input
          className="field-input"
          placeholder={placeholder ?? "City or airport name"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={handleBlur}
          autoComplete="off"
        />

        {/* Loading spinner inside the input */}
        {loading && (
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "14px",
              height: "14px",
              border: "2px solid var(--color-lagoon)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--color-shell)",
            border: "1px solid #E0D9D0",
            borderRadius: "var(--radius-input)",
            boxShadow: "var(--shadow-card)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          {results.map((airport) => (
            <button
              key={airport.iata}
              type="button" // prevent form submit
              onMouseDown={() => handleSelect(airport)} // mousedown fires before blur
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "10px 14px",
                background: "none",
                border: "none",
                borderBottom: "1px solid #F0EBE4",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F5F0EA")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {/* IATA badge */}
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--color-lagoon)",
                  minWidth: "36px",
                }}
              >
                {airport.iata}
              </span>

              {/* City + airport name */}
              <span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--color-ocean)",
                    display: "block",
                  }}
                >
                  {airport.city}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: "var(--color-driftwood)",
                  }}
                >
                  {airport.name} · {airport.country}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results state */}
      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--color-shell)",
            border: "1px solid #E0D9D0",
            borderRadius: "var(--radius-input)",
            padding: "12px 14px",
            zIndex: 50,
            fontSize: "13px",
            color: "var(--color-driftwood)",
            fontFamily: "var(--font-body)",
          }}
        >
          No airports found for "{query}"
        </div>
      )}
    </div>
  );
}
