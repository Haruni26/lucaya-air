export function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatMiles(miles: number): string {
  return '${miles.toLocaleString("en-US")} miles';
}
