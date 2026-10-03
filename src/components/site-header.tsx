"use client";

import {
  Add01Icon,
  ArrowUpRight01Icon,
  Building03Icon,
  DashboardBrowsingIcon,
  Home01Icon,
  Package01Icon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserButton, type UserButtonLink } from "@/components/auth/user/user-button";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicNavigation, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const mobileNavigation = [
  { href: "/", label: "Home", icon: Home01Icon },
  ...publicNavigation,
  { href: "/dashboard", label: "Dashboard", icon: DashboardBrowsingIcon },
] as const;

const userButtonLinks: UserButtonLink[] = [
  {
    label: "Profile",
    href: "/dashboard/settings/profile",
    icon: <HugeiconsIcon className="text-muted-foreground" icon={UserIcon} />,
    visibility: "authenticated",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <HugeiconsIcon className="text-muted-foreground" icon={DashboardBrowsingIcon} />,
    visibility: "authenticated",
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: <HugeiconsIcon className="text-muted-foreground" icon={Package01Icon} />,
    visibility: "authenticated",
  },
  {
    label: "Organizations",
    href: "/dashboard/organizations",
    icon: <HugeiconsIcon className="text-muted-foreground" icon={Building03Icon} />,
    visibility: "authenticated",
  },
];

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function HeaderSearch({ className }: { className?: string }) {
  return (
    <search className={className}>
      <form action="/explore" className="relative">
        <label className="sr-only" htmlFor="header-search">
          Search plugins
        </label>
        <HugeiconsIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          icon={Search01Icon}
        />
        <Input
          className="h-10 bg-card pl-9"
          id="header-search"
          name="q"
          placeholder="Search plugins"
          type="search"
        />
      </form>
    </search>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const showSearch = !pathname.startsWith("/explore");

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <nav
          aria-label="Primary navigation"
          className="container mx-auto flex h-16 items-center gap-6 px-4 md:px-6 lg:h-18"
        >
          <BrandMark imageClassName="w-28 lg:w-32" withIcon />

          <div className="hidden items-center gap-6 lg:flex">
            {publicNavigation.map((item) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "border-transparent border-b-2 py-2 font-display font-semibold text-[15px] text-muted-foreground transition-colors hover:text-foreground",
                    active && "border-primary text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              className="inline-flex items-center gap-1.5 py-2 font-display font-semibold text-[15px] text-ember-text transition-colors hover:text-foreground"
              href={siteConfig.hubUrl}
            >
              Bedrock Nexus
              <HugeiconsIcon aria-hidden="true" className="size-3.5" icon={ArrowUpRight01Icon} />
            </a>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {showSearch ? <HeaderSearch className="hidden w-64 md:block" /> : null}
            {showSearch ? (
              <Link
                aria-label="Search plugins"
                className={cn(buttonVariants({ size: "icon-lg", variant: "outline" }), "md:hidden")}
                href="/explore"
              >
                <HugeiconsIcon className="size-5" icon={Search01Icon} />
              </Link>
            ) : null}
            <ThemeToggle />
            <Link
              aria-label="Publish a plugin"
              className={cn(
                buttonVariants({ size: "icon-lg", variant: "brand" }),
                "hidden lg:inline-flex",
              )}
              href="/dashboard/projects/new"
              title="Publish a plugin"
            >
              <HugeiconsIcon aria-hidden="true" icon={Add01Icon} strokeWidth={2.5} />
            </Link>
            <div className="hidden lg:block">
              <UserButton links={userButtonLinks} size="icon" />
            </div>
          </div>
        </nav>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
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
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-sm px-1 py-1.5 text-muted-foreground",
                  active && "bg-primary text-primary-foreground",
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
              links={userButtonLinks}
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
