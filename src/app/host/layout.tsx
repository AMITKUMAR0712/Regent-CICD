import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/components/dashboard/shell";

const NAV_ITEMS = [
  { href: "/host", label: "Dashboard" },
  { href: "/host/requests", label: "My requests" },
  { href: "/host/profile", label: "Profile", exists: true },
];

export default async function HostLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HOST") {
    redirect("/login");
  }

  return (
    <DashboardShell
      homeHref="/host"
      navItems={NAV_ITEMS}
      userName={session.user.name ?? "Host"}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
