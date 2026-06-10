/**
 * Seed script — creates demo users, leads, and one completed transaction.
 *
 * NOTE: demo users exist only in the Prisma `User` table, not in Supabase Auth,
 * so you can't sign in as them. They exist to populate the marketplace and
 * admin dashboard with realistic data. Create your own account through /signup.
 */
import { PrismaClient, Urgency } from "@prisma/client";

const db = new PrismaClient();

const DAY = 86_400_000;

async function main() {
  console.log("Seeding LeadRelay…");

  const seller = await db.user.upsert({
    where: { email: "demo-seller@leadrelay.dev" },
    update: {},
    create: {
      id: "seed-user-seller",
      email: "demo-seller@leadrelay.dev",
      companyName: "Macomb Custom Carpentry",
      phone: "586-555-0142",
      trade: "Carpentry",
      zipCodes: ["48080", "48081", "48082"],
      subscriptionPlan: "PRO",
    },
  });

  const buyer = await db.user.upsert({
    where: { email: "demo-buyer@leadrelay.dev" },
    update: {},
    create: {
      id: "seed-user-buyer",
      email: "demo-buyer@leadrelay.dev",
      companyName: "Shoreline Electric LLC",
      phone: "586-555-0188",
      trade: "Electrical",
      zipCodes: ["48080", "48043"],
      subscriptionPlan: "FREE",
    },
  });

  const leadSpecs: Array<{
    jobType: string;
    locationZip: string;
    budgetMin: number;
    budgetMax: number;
    description: string;
    urgency: Urgency;
    price: number;
  }> = [
    {
      jobType: "Carpentry",
      locationZip: "48080",
      budgetMin: 150000,
      budgetMax: 350000,
      description:
        "Homeowner wants a 12x16 composite deck with railing replaced on a lakeside colonial. Old deck already demoed. Materials budget approved, looking to start within 3 weeks.",
      urgency: "MEDIUM",
      price: 4500,
    },
    {
      jobType: "Electrical",
      locationZip: "48081",
      budgetMin: 80000,
      budgetMax: 120000,
      description:
        "Panel upgrade from 100A to 200A plus EV charger install in attached garage. Homeowner has the charger on hand. Permit pull required.",
      urgency: "HIGH",
      price: 6000,
    },
    {
      jobType: "Plumbing",
      locationZip: "48082",
      budgetMin: 30000,
      budgetMax: 60000,
      description:
        "Water heater (40 gal gas) failing, intermittent hot water. Customer wants replacement quote this week. Basement access is easy, existing venting in good shape.",
      urgency: "EMERGENCY",
      price: 3500,
    },
    {
      jobType: "Roofing",
      locationZip: "48043",
      budgetMin: 900000,
      budgetMax: 1400000,
      description:
        "Full tear-off and re-shingle on a 2,200 sq ft ranch, architectural shingles. Two layers currently on. Insurance claim approved, homeowner choosing contractor directly.",
      urgency: "MEDIUM",
      price: 9500,
    },
    {
      jobType: "HVAC",
      locationZip: "48080",
      budgetMin: 500000,
      budgetMax: 800000,
      description:
        "Furnace + AC combo replacement in a 1,800 sq ft home. Existing system is 22 years old. Customer wants high-efficiency options and financing info.",
      urgency: "LOW",
      price: 5500,
    },
    {
      jobType: "Painting",
      locationZip: "48081",
      budgetMin: 250000,
      budgetMax: 400000,
      description:
        "Whole-interior repaint, 3 bed / 2 bath, walls and trim, neutral palette already picked. House is vacant between tenants — flexible access, wants it done in 2 weeks.",
      urgency: "HIGH",
      price: 4000,
    },
  ];

  const leads = [];
  for (const [i, spec] of leadSpecs.entries()) {
    const lead = await db.lead.create({
      data: {
        ...spec,
        sellerId: seller.id,
        contactName: ["Dana Whitfield", "Marcus Lee", "Priya Raman", "Tom Kowalski", "Elena Garza", "Sam Okafor"][i],
        contactPhone: `586-555-01${(60 + i).toString()}`,
        contactEmail: `customer${i + 1}@example.com`,
        expiresAt: new Date(Date.now() + 14 * DAY),
        createdAt: new Date(Date.now() - i * DAY),
      },
    });
    leads.push(lead);
  }

  // Mark one lead sold with a matching transaction so the dashboards have revenue.
  const soldLead = leads[1];
  await db.lead.update({
    where: { id: soldLead.id },
    data: { status: "SOLD", buyerId: buyer.id, soldAt: new Date(Date.now() - DAY) },
  });
  await db.transaction.upsert({
    where: { stripePaymentId: "seed_pi_demo_001" },
    update: {},
    create: {
      leadId: soldLead.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      amount: soldLead.price,
      fee: Math.round(soldLead.price * 0.15),
      sellerPayout: soldLead.price - Math.round(soldLead.price * 0.15),
      stripePaymentId: "seed_pi_demo_001",
    },
  });

  await db.systemEvent.create({
    data: { type: "CRON_CLEANUP", metadata: { expired: 0, note: "seed" } },
  });

  console.log(`Seeded ${leadSpecs.length} leads, 2 demo users, 1 transaction.`);
  console.log("Tip: set ADMIN_EMAIL in .env to your own email, then sign up with it to get the admin console.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
