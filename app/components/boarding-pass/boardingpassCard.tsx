"use client";

import type { BoardingPass } from "@/app/types";
import { formatTime, formatDate } from "@/app/lib/utils/flights";

interface Props {
  pass: BoardingPass;
}

export default function BoardingPassCard({ pass }: Props) {
  return (
    <div className="boarding-pass text-white overflow-hidden">
      {/* Flight info  */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div
              className="text-xs uppercase tracking-widest opacity-60 mb-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Boarding Pass
            </div>
            <div
              className="text-3xl font-light"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {pass.passenger.name}
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-xs opacity-60 mb-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Flight
            </div>
            <div
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {pass.flight.number}
            </div>
          </div>
        </div>

        {/* Route display */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <div
              className="text-5xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {pass.flight.origin.iata}
            </div>
            <div
              className="text-sm opacity-70"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {pass.flight.origin.city}
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xl mb-1">✈</div>
            <div
              className="w-full h-px opacity-30"
              style={{ background: "white" }}
            />
          </div>
          <div className="text-right">
            <div
              className="text-5xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {pass.flight.destination.iata}
            </div>
            <div
              className="text-sm opacity-70"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {pass.flight.destination.city}
            </div>
          </div>
        </div>

        {/* Flight details grid */}
        <div className="grid grid-cols-4 gap-3">
          <PassDetail label="Date" value={formatDate(pass.flight.departs_at)} />
          <PassDetail
            label="Departs"
            value={formatTime(pass.flight.departs_at)}
          />
          <PassDetail label="Gate" value={pass.gate} />
          <PassDetail label="Boards" value={formatTime(pass.boarding_time)} />
        </div>
      </div>

      {/* Tear line */}
      <div className="boarding-pass-tear mx-0" />

      {/* Passenger details */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <PassDetail label="Seat" value={pass.passenger.seat} large />
          <PassDetail label="Class" value={pass.passenger.cabin_class} />
          <PassDetail
            label="Boarding"
            value={pass.passenger.boarding_group.replace("Group ", "G")}
          />
        </div>

        {/* Barcode placeholder */}
        <div className="flex flex-col items-center">
          <div
            className="w-full h-16 rounded-lg mb-2 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            {/* Work in progress: render a real barcode with a library like `bwip-js` */}
            <div className="flex gap-0.5">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i % 3 === 0 ? "3px" : "1.5px",
                    height: i % 5 === 0 ? "48px" : "36px",
                    background: "rgba(255,255,255,0.8)",
                  }}
                />
              ))}
            </div>
          </div>
          <div
            className="text-xs opacity-50 tracking-widest"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {pass.confirmation_no}
          </div>
        </div>
      </div>
    </div>
  );
}

function PassDetail({
  label,
  value,
  large = false,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div>
      <div
        className="text-xs uppercase tracking-widest opacity-50 mb-0.5"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </div>
      <div
        className={large ? "text-3xl font-bold" : "text-sm font-medium"}
        style={{
          fontFamily: large ? "var(--font-display)" : "var(--font-body)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
