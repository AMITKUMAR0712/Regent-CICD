import type { KycStatus, Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    kycStatus: KycStatus;
    emailVerifiedAt: Date | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      kycStatus: KycStatus;
      emailVerifiedAt: Date | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    kycStatus: KycStatus;
    emailVerifiedAt: Date | null;
  }
}
