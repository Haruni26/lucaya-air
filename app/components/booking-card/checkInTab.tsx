"use client";

import { useState } from "react";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import BoardingPassCard from "@/app/components/boarding-pass/boardingpassCard";
import type { BoardingPass } from "@/app/types";

export default function CheckInTab() {
  const [confirmationNo, setConfirmationNo] = useState("");
  const [email, setEmail] = useState("");
  const [boardingPass, setBoardingPass] = useState<BoardingPass | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/boarding-pass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation_no: confirmationNo, email }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Check-in failed. Please try again.");
    } else {
      setBoardingPass(json.data);
    }
    setLoading(false);
  }

  // Once checked in, show the boarding pass
  if (boardingPass) {
    return (
      <div>
        <p
          className="text-sm mb-4 text-center"
          style={{ color: "var(--color-lagoon)" }}
        >
          ✓ Check-in complete — your boarding pass is ready
        </p>
        <BoardingPassCard pass={boardingPass} />
        <button
          className="w-full text-center text-sm mt-4"
          style={{
            color: "var(--color-driftwood)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => {
            setBoardingPass(null);
            setConfirmationNo("");
            setEmail("");
          }}
        >
          Check in another passenger
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2
        className="text-2xl font-light mb-1"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-ocean)",
        }}
      >
        Online check-in
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-driftwood)" }}>
        Check in up to 24 hours before your flight and get your boarding pass
        instantly.
      </p>

      <form onSubmit={handleCheckIn} className="space-y-4">
        <Input
          label="Confirmation Number"
          placeholder="LA-2025-48293"
          value={confirmationNo}
          onChange={(e) => setConfirmationNo(e.target.value.toUpperCase())}
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && (
          <p className="text-sm" style={{ color: "var(--color-coral)" }}>
            {error}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          Check In & Get Boarding Pass
        </Button>
      </form>
    </div>
  );
}
