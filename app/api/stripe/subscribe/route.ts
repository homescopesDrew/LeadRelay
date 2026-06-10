import { NextRequest, NextResponse } from "next/server";
import { db, logSystemEvent } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { stripe, PLAN_CONFIG } from "@/lib/stripe";

/** Creates a subscription Checkout session for Pro/Elite. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { plan } = (await req.json()) as { plan: "PRO" | "ELITE" };
    const priceId = PLAN_CONFIG[plan]?.priceId;
    if (!priceId) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
      customerId = customer.id;
      await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { kind: "subscription", userId: user.id, plan },
      success_url: `${appUrl}/dashboard?upgraded=1`,
      cancel_url: `${appUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED")
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    await logSystemEvent("ERROR", { scope: "stripe/subscribe", message: String(err) });
    return NextResponse.json({ error: "Couldn't start checkout" }, { status: 500 });
  }
}
