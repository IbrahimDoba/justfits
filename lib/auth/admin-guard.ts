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
const isAdminRole = (role?: string | null) =>
  !!role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  // Fast path: trust an admin role already present on the token.
  if (isAdminRole(session.user.role)) {
    return session;
  }

  // Fall back to the authoritative DB role. Stale tokens may be missing `id`
  // and/or `role`, but the standard `email` claim is reliably present — look
  // the user up by whichever identifier we have.
  const id = session.user.id;
  const email = session.user.email;
  if (!id && !email) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: id ? { id } : { email: email as string },
    select: { role: true },
  });
  if (!user || !isAdminRole(user.role)) {
    return null;
  }
  return session;
}
