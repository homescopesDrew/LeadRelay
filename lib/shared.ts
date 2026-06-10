/**
 * Client-safe shared constants and pure helpers.
 * No server-only imports (Prisma, Stripe, Resend) allowed in this file.
 */
export const TRADES = [
  "Carpentry",
  "Electrical",
  "Plumbing",
  "Roofing",
  "Remodeling",
  "Painting",
  "HVAC",
  "Landscaping",
  "Flooring",
  "General Contracting",
] as const;

export const fmtUsd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function maskName(name: string) {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first ? `${first} ${"█".repeat(6)}` : "████████";
}
