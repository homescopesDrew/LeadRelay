import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const profileSchema = z.object({
  companyName: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  trade: z.string().max(60).optional(),
  zipCodes: z.array(z.string().regex(/^\d{5}$/)).max(25).optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = profileSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const updated = await db.user.update({ where: { id: user.id }, data: parsed.data });
    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED")
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
