import { db } from "@/lib/db";
import { PLAN_CONFIG, type PlanKey } from "@/lib/stripe";
import { sendNewLeadMatchEmail } from "@/lib/email";
import type { Lead, Prisma } from "@prisma/client";

export { TRADES, fmtUsd, maskName } from "@/lib/shared";

export const LEAD_LIFETIME_DAYS = 14;

export type MarketplaceFilters = {
  trade?: string;
  zip?: string;
  maxPrice?: number; // cents
  urgency?: string;
};

export async function listAvailableLeads(filters: MarketplaceFilters) {
  const where: Prisma.LeadWhereInput = { status: "AVAILABLE", expiresAt: { gt: new Date() } };
  if (filters.trade) where.jobType = filters.trade;
  // Simple zip-prefix radius: same 3-digit ZIP prefix ≈ same metro area.
  if (filters.zip && filters.zip.length >= 3)
    where.locationZip = { startsWith: filters.zip.slice(0, 3) };
  if (filters.maxPrice && Number.isFinite(filters.maxPrice)) where.price = { lte: filters.maxPrice };
  if (filters.urgency && ["LOW", "MEDIUM", "HIGH", "EMERGENCY"].includes(filters.urgency))
    where.urgency = filters.urgency as Lead["urgency"];

  return db.lead.findMany({
    where,
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    take: 60,
  });
}

/** How many leads a buyer has purchased this calendar month (for FREE tier limits). */
export async function purchasesThisMonth(buyerId: string) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return db.transaction.count({ where: { buyerId, createdAt: { gte: start } } });
}

export function canPurchase(plan: PlanKey, purchaseCount: number) {
  return purchaseCount < PLAN_CONFIG[plan].monthlyPurchaseLimit;
}

/** Notify contractors whose trade + zip prefix match a freshly posted lead. */
export async function notifyMatchingContractors(lead: Lead) {
  const zipPrefix = lead.locationZip.slice(0, 3);
  const matches = await db.user.findMany({
    where: {
      trade: lead.jobType,
      id: { not: lead.sellerId },
    },
    take: 200,
  });
  const inArea = matches.filter((u) => u.zipCodes.some((z) => z.startsWith(zipPrefix)));
  // Elite subscribers get notified first (priority notifications).
  inArea.sort((a, b) => {
    const rank = { ELITE: 0, PRO: 1, FREE: 2 } as const;
    return rank[a.subscriptionPlan] - rank[b.subscriptionPlan];
  });
  for (const user of inArea) {
    await sendNewLeadMatchEmail(user.email, user.id, lead);
  }
  return inArea.length;
}
