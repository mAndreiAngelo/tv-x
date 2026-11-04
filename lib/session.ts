import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Signed-in user, verified against the database (once per request).
 * A session can outlive its user, e.g. after `npm run seed` resets the database.
 */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
});

/** Current user id, or null for guests. */
export async function getUserId() {
  return (await getCurrentUser())?.id ?? null;
}

/** Redirects guests to the login page and comes back to `returnTo` afterwards. */
export async function requireUser(returnTo: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/autentificare?next=${encodeURIComponent(returnTo)}`);
  return user;
}
