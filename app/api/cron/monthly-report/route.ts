import { NextRequest, NextResponse } from "next/server";
import { db, logSystemEvent } from "@/lib/db";
import { unauthorizedCron } from "@/lib/cron";
import { sendMonthlyRevenueReport } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Monthly: revenue report to admin (runs on the 1st, reports prior month). */
export async function GET(req: NextRequest) {
  const denied = unauthorizedCron(req);
  if (denied) return denied;

  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);

    const [fees, txCount, newUsers, leadsPosted] = await Promise.all([
      db.transaction.aggregate({ _sum: { fee: true }, where: { createdAt: { gte: start, lt: end } } }),
      db.transaction.count({ where: { createdAt: { gte: start, lt: end } } }),
      db.user.count({ where: { createdAt: { gte: start, lt: end } } }),
      db.lead.count({ where: { createdAt: { gte: start, lt: end } } }),
    ]);

    await sendMonthlyRevenueReport({
      month: start.toLocaleString("en-US", { month: "long", year: "numeric" }),
      feeRevenue: fees._sum.fee ?? 0,
      transactions: txCount,
      newUsers,
      leadsPosted,
    });

    await logSystemEvent("CRON_MONTHLY", { feeRevenue: fees._sum.fee ?? 0, transactions: txCount });
    return NextResponse.json({ ok: true });
  } catch (err) {
    await logSystemEvent("ERROR", { scope: "cron/monthly-report", message: String(err) });
    return NextResponse.json({ error: "Monthly report failed" }, { status: 500 });
  }
}
