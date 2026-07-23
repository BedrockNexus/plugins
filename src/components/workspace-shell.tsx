"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  DashboardCircleIcon,
  Settings01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { UserButton } from "@/components/auth/user/user-button";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const dashboardNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardCircleIcon, exact: true },
  { href: "/settings/account", label: "Account", icon: Settings01Icon, exact: false },
  { href: "/settings/security", label: "Security", icon: Shield01Icon, exact: false },
] as const;

function isActiveRoute(pathname: string, href: string, exact = false) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceShell({ label, children }: { label: string; children: ReactNode }) {
  const pathname = usePathname();
  const isAdministration = label === "Administration";
  const navigation = isAdministration
    ? [{ href: "/admin", label: "Moderation", icon: Shield01Icon, exact: true } as const]
    : dashboardNavigation;

  return (
    <div className="min-h-screen bg-muted/35">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <BrandMark imageClassName="w-36 sm:w-40" />
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
            <span className="hidden truncate text-muted-foreground text-sm sm:block">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-md px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground sm:flex"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" aria-hidden="true" />
              Website
            </Link>
            <UserButton size="icon" />
          </div>
        </div>
      </header>

      <div className="border-b bg-background">
        <nav
          aria-label={`${label} navigation`}
          className="container mx-auto flex min-w-0 items-center overflow-x-auto px-4 [scrollbar-width:none] md:gap-1 md:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {navigation.map((item) => {
            const active = isActiveRoute(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-12 min-w-0 flex-1 items-center justify-center gap-2 px-2 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground sm:flex-none sm:justify-start sm:px-3 sm:text-sm",
                  active &&
                    "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary",
                )}
              >
                <HugeiconsIcon icon={item.icon} className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 px-2 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground sm:hidden"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" aria-hidden="true" />
            Website
          </Link>
        </nav>
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
