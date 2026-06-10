import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, feeForPlan, planFromPriceId } from "@/lib/stripe";
import { db, logSystemEvent } from "@/lib/db";
import { sendBuyerLeadEmail, sendSellerSoldEmail, sendAdminAlert } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    await logSystemEvent("ERROR", { scope: "stripe/webhook", message: `Bad signature: ${err}` });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.kind === "lead_purchase") await handleLeadPurchase(session);
        // Subscription activation is handled by customer.subscription.updated below.
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await logSystemEvent("STRIPE_WEBHOOK", {
          type: event.type,
          customer: invoice.customer,
          amount: invoice.amount_paid,
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await logSystemEvent("PAYMENT_FAILED", { customer: invoice.customer, amount: invoice.amount_due });
        await sendAdminAlert(
          "Subscription payment failed",
          `Customer ${invoice.customer} failed to pay ${invoice.amount_due} cents.`
        );
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const plan = planFromPriceId(sub.items.data[0]?.price.id);
        const active = ["active", "trialing"].includes(sub.status);
        await db.user.updateMany({
          where: { stripeCustomerId: String(sub.customer) },
          data: {
            subscriptionPlan: active ? plan : "FREE",
            stripeSubscriptionId: sub.id,
          },
        });
        await logSystemEvent("STRIPE_WEBHOOK", { type: event.type, plan, status: sub.status });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db.user.updateMany({
          where: { stripeCustomerId: String(sub.customer) },
          data: { subscriptionPlan: "FREE", stripeSubscriptionId: null },
        });
        await logSystemEvent("STRIPE_WEBHOOK", { type: event.type });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    await logSystemEvent("ERROR", { scope: "stripe/webhook", eventType: event.type, message: String(err) });
    await sendAdminAlert("Webhook handler error", `${event.type}: ${err}`);
    // Return 500 so Stripe retries.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleLeadPurchase(session: Stripe.Checkout.Session) {
  const { leadId, buyerId } = session.metadata!;
  const paymentId = String(session.payment_intent ?? session.id);

  // Idempotency: skip if this payment is already recorded.
  const existing = await db.transaction.findUnique({ where: { stripePaymentId: paymentId } });
  if (existing) return;

  // Atomically claim the lead; first webhook delivery wins.
  const claimed = await db.lead.updateMany({
    where: { id: leadId, status: "AVAILABLE" },
    data: { status: "SOLD", buyerId, soldAt: new Date() },
  });
  if (claimed.count === 0) {
    await sendAdminAlert(
      "Payment for unavailable lead",
      `Buyer ${buyerId} paid for lead ${leadId} but it was not AVAILABLE. Refund manually in Stripe (payment ${paymentId}).`,
      { leadId, buyerId, paymentId }
    );
    return;
  }

  const lead = await db.lead.findUniqueOrThrow({ where: { id: leadId } });
  const buyer = await db.user.findUniqueOrThrow({ where: { id: buyerId } });
  const seller = await db.user.findUniqueOrThrow({ where: { id: lead.sellerId } });

  const amount = session.amount_total ?? lead.price;
  const fee = feeForPlan(seller.subscriptionPlan, amount);

  await db.transaction.create({
    data: {
      leadId,
      buyerId,
      sellerId: lead.sellerId,
      amount,
      fee,
      sellerPayout: amount - fee,
      stripePaymentId: paymentId,
    },
  });

  await sendBuyerLeadEmail(buyer.email, buyer.id, lead);
  await sendSellerSoldEmail(seller.email, seller.id, lead, amount - fee);
  await logSystemEvent("STRIPE_WEBHOOK", { type: "lead_purchase", leadId, amount, fee });
}
