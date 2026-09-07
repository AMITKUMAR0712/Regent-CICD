import Link from "next/link";

import { UserMenu } from "@/components/dashboard/user-menu";
import { PartyBackdrop } from "@/components/party/party-backdrop";

export type DashboardNavItem = {
  href: string;
  label: string;
  /** Set true once the page actually exists — avoids prefetching a 404. */
  exists?: boolean;
};

export function DashboardShell({
  homeHref,
  navItems,
  userName,
  userEmail,
  children,
}: {
  homeHref: string;
  navItems: DashboardNavItem[];
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="night relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <PartyBackdrop density="calm" className="fixed" />

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-background/70 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <Link href={homeHref} className="font-heading text-lg font-bold text-primary">
            PartySpace
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={item.href === homeHref || item.exists}
                className="text-sm text-muted-foreground transition-colors hover:text-glow"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <UserMenu name={userName} email={userEmail} />
      </header>
      <main className="relative z-10 flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
