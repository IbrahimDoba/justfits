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

      // Keep the token in sync with the database so role changes take effect
      // without re-login. Resolve by id OR the (unique) email: a token can
      // carry an orphaned id if the user row was recreated, in which case the
      // email still points at the right row — and we correct the id here.
      const tokenId = (token.id as string) || token.sub;
      const tokenEmail = token.email as string | undefined;
      if (tokenId || tokenEmail) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                ...(tokenId ? [{ id: tokenId }] : []),
                ...(tokenEmail ? [{ email: tokenEmail }] : []),
              ],
            },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch {
          // On a DB hiccup, keep whatever is already on the token.
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
