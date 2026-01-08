import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check if accessing admin routes
  if (pathname.startsWith("/admin")) {
    const session = req.auth;

    // Not logged in - redirect to login
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check for admin role (when database is connected, this will work)
    // For now, allow all authenticated users for development
    // TODO: Enable role check when users have roles in database
    // if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    //   return NextResponse.redirect(new URL("/", req.url));
    // }
  }

  return NextResponse.next();
});

// Use Node.js runtime instead of Edge to support Prisma
export const runtime = "nodejs";

export const config = {
  matcher: ["/admin/:path*"],
};
