import { NextRequest, NextResponse } from "next/server";
import { db, logSystemEvent } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { maskName } from "@/lib/marketplace";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const lead = await db.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.status === "REMOVED")
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const user = await getCurrentUser();
  const canSeeContact =
    !!user && (user.id === lead.sellerId || user.id === lead.buyerId || user.role === "ADMIN");

  if (canSeeContact) return NextResponse.json({ lead });

  const { contactPhone, contactEmail, contactName, ...rest } = lead;
  return NextResponse.json({
    lead: { ...rest, contactName: maskName(contactName), contactPhone: "███-███-████", contactEmail: "████@████.com" },
  });
}

/** Admin moderation: remove or expire a lead. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const { status } = await req.json();
    if (!["REMOVED", "EXPIRED", "AVAILABLE"].includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    const lead = await db.lead.update({ where: { id: params.id }, data: { status } });
    await logSystemEvent("MODERATION", { leadId: lead.id, status });
    return NextResponse.json({ lead });
  } catch (err) {
    if (err instanceof Error && ["UNAUTHENTICATED", "FORBIDDEN"].includes(err.message))
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
