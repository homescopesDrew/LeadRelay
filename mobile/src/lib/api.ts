/**
 * Service layer for the LeadRelay web API. All network calls go through here.
 * Auth is a Supabase access token sent as an Authorization: Bearer header.
 */
import { supabase } from "@/lib/supabase";
import type { Lead, Plan, Profile, Urgency } from "@/lib/types";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message = typeof body.error === "string" ? body.error : "Something went wrong. Try again.";
    throw new ApiError(message, res.status);
  }
  return body as T;
}

export type LeadFilters = { trade?: string; zip?: string; maxPrice?: string; urgency?: string };

export function getLeads(filters: LeadFilters) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) q.set(key, value);
  }
  const qs = q.toString();
  return api<{ leads: Lead[] }>(`/api/leads${qs ? `?${qs}` : ""}`);
}

export function getLead(id: string) {
  return api<{ lead: Lead }>(`/api/leads/${id}`);
}

export type NewLead = {
  jobType: string;
  locationZip: string;
  budgetMin: number;
  budgetMax: number;
  description: string;
  urgency: Urgency;
  price: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
};

export function createLead(payload: NewLead) {
  return api<{ lead: Lead }>("/api/leads", { method: "POST", body: JSON.stringify(payload) });
}

export function getDashboard() {
  return api<{ user: Profile; myLeads: Lead[]; purchases: Lead[]; totalEarnings: number }>(
    "/api/dashboard"
  );
}

export function updateProfile(payload: {
  companyName?: string;
  phone?: string;
  trade?: string;
  zipCodes?: string[];
}) {
  return api<{ user: Profile }>("/api/profile", { method: "PATCH", body: JSON.stringify(payload) });
}

export function startLeadCheckout(leadId: string) {
  return api<{ url: string }>("/api/stripe/checkout", {
    method: "POST",
    body: JSON.stringify({ leadId }),
  });
}

export function startSubscriptionCheckout(plan: Exclude<Plan, "FREE">) {
  return api<{ url: string }>("/api/stripe/subscribe", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
}
