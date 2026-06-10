import { NextRequest, NextResponse } from "next/server";

/** Verifies Vercel cron requests via the CRON_SECRET bearer token. */
export function unauthorizedCron(req: NextRequest): NextResponse | null {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
