import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Dashboard data for the mobile app (the web dashboard queries the DB directly). */
export async function GET() {
  try {
    const user = await requireUser();
    const [myLeads, purchases, earnings] = await Promise.all([
      db.lead.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
      db.lead.findMany({ where: { buyerId: user.id }, orderBy: { soldAt: "desc" }, take: 20 }),
      db.transaction.aggregate({ _sum: { sellerPayout: true }, where: { sellerId: user.id } }),
    ]);
    return NextResponse.json({
      user,
      myLeads,
      purchases,
      totalEarnings: earnings._sum.sellerPayout ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
}
