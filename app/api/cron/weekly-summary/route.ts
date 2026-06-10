import { NextRequest, NextResponse } from "next/server";
import { db, logSystemEvent } from "@/lib/db";
import { unauthorizedCron } from "@/lib/cron";
import { sendWeeklySummaryEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Weekly: marketplace activity summary to all users. */
export async function GET(req: NextRequest) {
  const denied = unauthorizedCron(req);
  if (denied) return denied;

  try {
    const since = new Date(Date.now() - 7 * 86400_000);
    const [newLeads, soldLeads, topTradeRow] = await Promise.all([
      db.lead.count({ where: { createdAt: { gte: since } } }),
      db.lead.count({ where: { soldAt: { gte: since } } }),
      db.lead.groupBy({
        by: ["jobType"],
        where: { createdAt: { gte: since } },
        _count: true,
        orderBy: { _count: { jobType: "desc" } },
        take: 1,
      }),
    ]);
    const topTrade = topTradeRow[0]?.jobType ?? null;

    const users = await db.user.findMany({ where: { role: "CONTRACTOR" }, take: 2000 });
    for (const u of users) {
      await sendWeeklySummaryEmail(u.email, u.id, { newLeads, soldLeads, topTrade });
    }

    await logSystemEvent("CRON_WEEKLY", { recipients: users.length, newLeads, soldLeads });
    return NextResponse.json({ ok: true, recipients: users.length });
  } catch (err) {
    await logSystemEvent("ERROR", { scope: "cron/weekly-summary", message: String(err) });
    return NextResponse.json({ error: "Weekly summary failed" }, { status: 500 });
  }
}
