import type { FlightStatus } from "@/app/types";

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function statusLabel(s: FlightStatus): string {
  return {
    scheduled: "Scheduled",
    boarding: "Now Boarding",
    departed: "Departed",
    in_flight: "In Flight",
    landed: "Landed",
    delayed: "Delayed",
    cancelled: "Cancelled",
  }[s];
}

export function statusColor(s: FlightStatus): string {
  return {
    scheduled: "var(--color-lagoon)",
    boarding: "var(--color-gold)",
    departed: "var(--color-ocean)",
    in_flight: "var(--color-reef)",
    landed: "var(--color-lagoon)",
    delayed: "var(--color-coral)",
    cancelled: "#cc3333",
  }[s];
}
