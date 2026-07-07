import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

/**
 * Guards admin-only API routes (finance data contains customer PII + money,
 * so it must stay admin-only).
 *
 * The role is verified against the DATABASE rather than trusting the JWT's
 * cached `role` claim. A session minted before an account was promoted to
 * ADMIN carries a stale `role: "CUSTOMER"` until the user signs in again —
 * checking the live DB role fixes those false 401s without weakening access.
 *
 * Returns the session on success, or null if the user is not a logged-in admin.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  // Fast path: trust an admin role already present on the token.
  if (
    session.user.role &&
    ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number])
  ) {
    return session;
  }

  // Fall back to the authoritative DB role (handles stale/unset token roles).
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || !ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) {
    return null;
  }
  return session;
}
