import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

/**
 * Edge-runtime auth instance used only by src/middleware.ts. Do not import
 * this from Server Components or Server Actions — use "@/lib/auth/auth"
 * there instead, which includes the actual Credentials provider.
 */
export const { auth } = NextAuth(authConfig);
