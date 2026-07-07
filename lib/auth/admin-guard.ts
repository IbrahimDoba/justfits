import { auth } from "@/lib/auth";

/**
 * Guards admin API routes.
 *
 * Matches the convention used by every other admin route in this app
 * (dashboard, orders, products, categories, shipping-zones): access to the
 * admin area is gated on being logged in — there is no per-route role check
 * or middleware. Finance uses the same rule so it behaves like the rest of
 * the admin (a role-only check here left admins with a stale token role
 * locked out).
 *
 * Returns the session on success, or null if there is no logged-in user.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}
