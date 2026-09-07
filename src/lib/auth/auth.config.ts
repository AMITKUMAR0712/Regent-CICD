import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe base config: no Prisma, no bcrypt, nothing that needs a Node
 * runtime. This is what src/middleware.ts imports (via auth-edge.ts) so the
 * database driver never gets pulled into the edge bundle. The Credentials
 * provider (which does need Prisma + bcrypt) is added on top of this in
 * auth.ts, which only ever runs in Node.js route handlers and server code.
 */
export const authConfig = {
  // Required for any self-hosted deployment (this app is plain `next start`
  // on Node.js, not Vercel, which is the only host Auth.js trusts by
  // default). Safe as long as the reverse proxy in front of Node sets
  // X-Forwarded-Host itself and isn't relaying an attacker-controlled Host
  // header — never expose the Node process directly to the internet.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
        token.kycStatus = user.kycStatus;
        token.emailVerifiedAt = user.emailVerifiedAt;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.kycStatus = token.kycStatus;
      session.user.emailVerifiedAt = token.emailVerifiedAt;
      return session;
    },
  },
} satisfies NextAuthConfig;
