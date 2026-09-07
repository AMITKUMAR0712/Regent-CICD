import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/components/dashboard/shell";

const NAV_ITEMS = [
  { href: "/admin", label: "Metrics" },
  { href: "/admin/hero", label: "Hero media", exists: true },
  { href: "/admin/kyc", label: "KYC queue", exists: true },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/plans", label: "Plans" },
];

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <DashboardShell
      homeHref="/admin"
      navItems={NAV_ITEMS}
      userName={session.user.name ?? "Admin"}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
