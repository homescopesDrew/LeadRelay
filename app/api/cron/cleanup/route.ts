import { NextRequest, NextResponse } from "next/server";
import { db, logSystemEvent } from "@/lib/db";
import { unauthorizedCron } from "@/lib/cron";

export const dynamic = "force-dynamic";

/** Daily: expire stale leads. */
export async function GET(req: NextRequest) {
  const denied = unauthorizedCron(req);
  if (denied) return denied;

  try {
    const result = await db.lead.updateMany({
      where: { status: "AVAILABLE", expiresAt: { lt: new Date() } },
      data: { status: "EXPIRED" },
    });
    await logSystemEvent("CRON_CLEANUP", { expired: result.count });
    return NextResponse.json({ ok: true, expired: result.count });
  } catch (err) {
    await logSystemEvent("ERROR", { scope: "cron/cleanup", message: String(err) });
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
