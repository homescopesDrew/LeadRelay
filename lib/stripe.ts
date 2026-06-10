import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLAN_CONFIG = {
  FREE: { feePct: 0.2, monthlyPurchaseLimit: 3, priceId: null as string | null },
  PRO: { feePct: 0.15, monthlyPurchaseLimit: Infinity, priceId: process.env.STRIPE_PRICE_PRO ?? null },
  ELITE: { feePct: 0.1, monthlyPurchaseLimit: Infinity, priceId: process.env.STRIPE_PRICE_ELITE ?? null },
} as const;

export type PlanKey = keyof typeof PLAN_CONFIG;

export function feeForPlan(plan: PlanKey, amountCents: number) {
  return Math.round(amountCents * PLAN_CONFIG[plan].feePct);
}

export function planFromPriceId(priceId: string | undefined | null): PlanKey {
  if (!priceId) return "FREE";
  if (priceId === process.env.STRIPE_PRICE_ELITE) return "ELITE";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "PRO";
  return "FREE";
}
