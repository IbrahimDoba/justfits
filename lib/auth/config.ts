import { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user.role as string) || "CUSTOMER";
      }

      // Keep the token's role in sync with the database so role changes
      // (e.g. promoting an account to ADMIN) take effect without the user
      // having to sign out and back in. Existing sessions can otherwise carry
      // a stale role for the full 30-day token lifetime.
      const userId = (token.id as string) || token.sub;
      if (userId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          });
          if (dbUser) {
            token.id = userId;
            token.role = dbUser.role;
          }
        } catch {
          // On a DB hiccup, keep whatever role is already on the token.
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "CUSTOMER";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
