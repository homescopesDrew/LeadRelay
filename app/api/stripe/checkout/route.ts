import { NextRequest, NextResponse } from "next/server";
import { db, logSystemEvent } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { canPurchase, purchasesThisMonth } from "@/lib/marketplace";

/** Creates a one-time Stripe Checkout session for buying a lead. */
export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured())
      return NextResponse.json(
        { error: "Purchases aren't live yet — payments are still being set up. Check back soon." },
        { status: 503 }
      );
    const user = await requireUser();
    const { leadId } = await req.json();

    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.status !== "AVAILABLE" || lead.expiresAt < new Date())
      return NextResponse.json({ error: "This lead is no longer available" }, { status: 409 });
    if (lead.sellerId === user.id)
      return NextResponse.json({ error: "You can't buy your own lead" }, { status: 400 });

    const count = await purchasesThisMonth(user.id);
    if (!canPurchase(user.subscriptionPlan, count))
      return NextResponse.json(
        { error: "Free plan limit reached (3 leads/month). Upgrade to keep buying." },
        { status: 403 }
      );

    // Ensure a Stripe customer exists for this user.
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: lead.price,
            product_data: {
              name: `${lead.jobType} lead — ZIP ${lead.locationZip}`,
              description: `Urgency: ${lead.urgency}. Contact info released after purchase.`,
            },
          },
        },
      ],
      metadata: { kind: "lead_purchase", leadId: lead.id, buyerId: user.id },
      success_url: `${appUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}&lead=${lead.id}`,
      cancel_url: `${appUrl}/lead/${lead.id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED")
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    await logSystemEvent("ERROR", { scope: "stripe/checkout", message: String(err) });
    return NextResponse.json({ error: "Couldn't start checkout" }, { status: 500 });
  }
}
