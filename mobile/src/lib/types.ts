/**
 * API types and client-safe helpers — mirrors the web app's lib/shared.ts
 * and the JSON shapes returned by its API routes (Prisma models serialized).
 */
export type Urgency = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
export type LeadStatus = "AVAILABLE" | "SOLD" | "EXPIRED" | "REMOVED";
export type Plan = "FREE" | "PRO" | "ELITE";

export type Lead = {
  id: string;
  sellerId: string;
  buyerId: string | null;
  jobType: string;
  locationZip: string;
  budgetMin: number;
  budgetMax: number;
  description: string;
  urgency: Urgency;
  price: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  photoUrls: string[];
  status: LeadStatus;
  expiresAt: string;
  soldAt: string | null;
  createdAt: string;
};

export type Profile = {
  id: string;
  email: string;
  role: "CONTRACTOR" | "ADMIN";
  companyName: string | null;
  phone: string | null;
  trade: string | null;
  zipCodes: string[];
  subscriptionPlan: Plan;
};

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

export const URGENCIES: { value: Urgency; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "EMERGENCY", label: "Emergency" },
];

/** Formats cents as USD without relying on Intl (not guaranteed on Hermes). */
export const fmtUsd = (cents: number) => {
  const dollars = cents / 100;
  const fixed = Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(2);
  const [whole, frac] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `$${grouped}.${frac}` : `$${grouped}`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const fmtDate = (iso: string | Date) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

/** The API masks contact fields with █ blocks for non-buyers. */
export const isMaskedContact = (lead: Lead) =>
  !lead.contactPhone || lead.contactPhone.includes("█");
