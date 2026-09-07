import type { Role } from "@prisma/client";

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "OWNER":
      return "/owner";
    case "HOST":
      return "/host";
    case "ADMIN":
      return "/admin";
  }
}
