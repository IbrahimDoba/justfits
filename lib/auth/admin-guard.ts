import { auth } from "@/lib/auth";

/**
 * Ensures the current session belongs to an admin (ADMIN or SUPER_ADMIN).
 * Returns the session on success, or null if unauthorized.
 */
export async function requireAdmin() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
  ) {
    return null;
  }
  return session;
}
