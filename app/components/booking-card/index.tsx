"use client";

import { useState } from "react";
import BookTab from "./bookTab";
import ManageTab from "./manageTab";
import CheckInTab from "./checkInTab";
// import MembershipTab from "./membershipTab";

type Tab = "book" | "manage" | "checkin" | "membership";

const TABS: { id: Tab; label: string }[] = [
  { id: "book", label: "Book" },
  { id: "manage", label: "Manage Trips" },
  { id: "checkin", label: "Check-In" },
  { id: "membership", label: "Membership" },
];

export default function BookingCard() {
  const [activeTab, setActiveTab] = useState<Tab>("book");

  return (
    <div className="card w-full overflow-hidden">
      {/* Tab navigation */}
      <div
        className="flex border-b overflow-x-auto"
        style={{ borderColor: "#E8E1D8" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`booking-tab flex-1 ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="p-6 md:p-8">
        {activeTab === "book" && <BookTab />}
        {activeTab === "manage" && <ManageTab />}
        {activeTab === "checkin" && <CheckInTab />}
        {/* {activeTab === "membership" && <MembershipTab />} */}
      </div>
    </div>
  );
}
