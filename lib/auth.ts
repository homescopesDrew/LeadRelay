import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

/**
 * Returns the current app user (Prisma row), creating it on first login.
 * Supabase owns credentials; Prisma owns the contractor profile.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const existing = await db.user.findUnique({ where: { id: authUser.id } });
  if (existing) return existing;

  return db.user.create({
    data: {
      id: authUser.id,
      email: authUser.email!,
      role: authUser.email === process.env.ADMIN_EMAIL ? "ADMIN" : "CONTRACTOR",
    },
  });
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
