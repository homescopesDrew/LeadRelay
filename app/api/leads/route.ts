import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, logSystemEvent } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { LEAD_LIFETIME_DAYS, listAvailableLeads, notifyMatchingContractors } from "@/lib/marketplace";

const createLeadSchema = z.object({
  jobType: z.string().min(2).max(60),
  locationZip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits"),
  budgetMin: z.number().int().min(0),
  budgetMax: z.number().int().min(0),
  description: z.string().min(20).max(4000),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]),
  price: z.number().int().min(500).max(100000), // $5–$1,000
  contactName: z.string().min(2).max(120),
  contactPhone: z.string().min(7).max(30),
  contactEmail: z.string().email(),
  photoUrls: z.array(z.string().url()).max(6).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    if (data.budgetMax < data.budgetMin) {
      return NextResponse.json({ error: "budgetMax must be ≥ budgetMin" }, { status: 400 });
    }

    const lead = await db.lead.create({
      data: {
        ...data,
        photoUrls: data.photoUrls ?? [],
        sellerId: user.id,
        expiresAt: new Date(Date.now() + LEAD_LIFETIME_DAYS * 86400_000),
      },
    });

    // Fire-and-forget matching notifications; don't block the response.
    notifyMatchingContractors(lead).catch((err) =>
      logSystemEvent("ERROR", { scope: "notifyMatchingContractors", leadId: lead.id, message: String(err) })
    );

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED")
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    await logSystemEvent("ERROR", { scope: "POST /api/leads", message: String(err) });
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const leads = await listAvailableLeads({
    trade: sp.get("trade") ?? undefined,
    zip: sp.get("zip") ?? undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    urgency: sp.get("urgency") ?? undefined,
  });
  // Strip contact info from public listings.
  const safe = leads.map(({ contactName, contactPhone, contactEmail, ...rest }) => rest);
  return NextResponse.json({ leads: safe });
}
