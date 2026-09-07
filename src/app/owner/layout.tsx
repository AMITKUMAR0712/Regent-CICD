import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/components/dashboard/shell";

const NAV_ITEMS = [
  { href: "/owner", label: "Dashboard" },
  { href: "/owner/listings", label: "Listings" },
  { href: "/owner/requests", label: "Requests" },
  { href: "/owner/subscription", label: "Subscription" },
  { href: "/owner/profile", label: "Profile", exists: true },
];

export default async function OwnerLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  return (
    <DashboardShell
      homeHref="/owner"
      navItems={NAV_ITEMS}
      userName={session.user.name ?? "Owner"}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
