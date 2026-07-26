"use client";

import { DashboardBrowsingIcon, Home01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserButton } from "@/components/auth/user/user-button";
import { BrandMark } from "@/components/brand-mark";
import { publicNavigation } from "@/lib/site";
import { cn } from "@/lib/utils";

const mobileNavigation = [
  { href: "/", label: "Home", icon: Home01Icon },
  ...publicNavigation,
  { href: "/dashboard", label: "Dashboard", icon: DashboardBrowsingIcon },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="hidden lg:block">
        <nav aria-label="Primary navigation" className="container mx-auto px-4 md:px-6">
          <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center">
            <BrandMark />

            <div className="flex items-center gap-1">
              {publicNavigation.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-4 py-2 font-medium text-muted-foreground text-sm transition-[color,background-color,filter] hover:bg-primary hover:text-primary-foreground hover:brightness-95",
                      active && "bg-primary text-primary-foreground shadow-sm",
                    )}
                  >
                    <HugeiconsIcon icon={item.icon} className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-end">
              <UserButton size="icon" />
            </div>
          </div>
        </nav>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-muted/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch">
          {mobileNavigation.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 text-muted-foreground",
                  active && "bg-background text-foreground shadow-sm",
                )}
              >
                <HugeiconsIcon icon={item.icon} className="size-5" aria-hidden="true" />
                <span className="truncate font-medium text-[11px]">{item.label}</span>
              </Link>
            );
          })}
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-1.5 text-muted-foreground">
            <UserButton
              align="center"
              className="size-5"
              sideOffset={12}
              size="icon"
              variant="ghost"
            />
            <span className="truncate font-medium text-[11px]">Account</span>
          </div>
        </div>
      </nav>
    </>
  );
}
