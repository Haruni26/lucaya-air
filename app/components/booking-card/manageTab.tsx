"use client";

import { useState } from "react";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import type { Booking } from "@/app/types";
import {
  formatDate,
  formatTime,
  statusLabel,
  statusColor,
} from "@/app/lib/utils/flights";
import { formatUSD } from "@/app/lib/utils/currency";

export default function ManageTab() {
  const [confirmationNo, setConfirmationNo] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBooking(null);

    const params = new URLSearchParams({ confirmation: confirmationNo, email });
    const res = await fetch(`/api/bookings?${params}`);
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Booking not found");
    } else {
      setBooking(json.data);
    }
    setLoading(false);
  }

  async function handleCancel() {
    if (!booking || !confirm("Are you sure you want to cancel this booking?"))
      return;
    setCancelling(true);

    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation_no: booking.confirmation_no, email }),
    });
    const json = await res.json();

    if (res.ok) {
      setBooking(json.data);
    } else {
      setError(json.error ?? "Could not cancel booking");
    }
    setCancelling(false);
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
        Manage your trip
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-driftwood)" }}>
        Enter your confirmation number and email to retrieve your booking.
      </p>

      <form onSubmit={handleLookup} className="space-y-4 mb-6">
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
          Find Booking
        </Button>
      </form>

      {/* Booking Details */}
      {booking && (
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{ borderColor: "#E0D9D0" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "var(--color-driftwood)" }}
              >
                Confirmation
              </div>
              <div
                className="text-2xl font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-ocean)",
                }}
              >
                {booking.confirmation_no}
              </div>
            </div>
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                background:
                  statusColor(booking.flight?.status ?? "scheduled") + "22",
                color: statusColor(booking.flight?.status ?? "scheduled"),
                fontFamily: "var(--font-body)",
              }}
            >
              {booking.status === "cancelled"
                ? "Cancelled"
                : statusLabel(booking.flight?.status ?? "scheduled")}
            </span>
          </div>

          {booking.flight && (
            <div
              className="flex items-center gap-4 py-3 border-t border-b"
              style={{ borderColor: "#E0D9D0" }}
            >
              <div>
                <div
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatTime(booking.flight.departs_at)}
                </div>
                <div className="text-sm font-medium">
                  {booking.flight.origin}
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--color-driftwood)" }}
                >
                  {booking.flight.flight_number}
                </div>
                <div
                  className="w-full h-px"
                  style={{ background: "#E0D9D0" }}
                />
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatTime(booking.flight.arrives_at)}
                </div>
                <div className="text-sm font-medium">
                  {booking.flight.destination}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-sm">
            <DetailItem
              label="Passenger"
              value={`${booking.first_name} ${booking.last_name}`}
            />
            <DetailItem label="Seat" value={booking.seat_number} />
            <DetailItem label="Cabin" value={booking.cabin_class} />
            <DetailItem
              label="Date"
              value={
                booking.flight ? formatDate(booking.flight.departs_at) : "—"
              }
            />
            <DetailItem
              label="Checked In"
              value={booking.checked_in ? "Yes" : "No"}
            />
            <DetailItem
              label="Price Paid"
              value={formatUSD(booking.price_paid)}
            />
          </div>

          {booking.status === "confirmed" && (
            <Button
              variant="ghost"
              loading={cancelling}
              onClick={handleCancel}
              className="w-full"
              style={{
                borderColor: "var(--color-coral)",
                color: "var(--color-coral)",
              }}
            >
              Cancel Booking
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <div
        className="font-medium capitalize"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {value}
      </div>
    </div>
  );
}
