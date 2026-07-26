"use client";

import {
  Alert01Icon,
  Analytics01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  Building03Icon,
  Cancel01Icon,
  Clock01Icon,
  DashboardBrowsingIcon,
  Menu01Icon,
  Package01Icon,
  Settings01Icon,
  Shield01Icon,
  WebhookIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { UserButton, type UserButtonLink } from "@/components/auth/user/user-button";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
  icon: IconSvgElement;
  exact?: boolean;
};

const dashboardNavigation: Array<{
  label: string;
  items: NavigationItem[];
}> = [
  {
    label: "Dashboard",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: DashboardBrowsingIcon,
        exact: true,
      },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/projects", label: "Projects", icon: Package01Icon },
      { href: "/dashboard/organizations", label: "Organizations", icon: Building03Icon },
      { href: "/dashboard/analytics", label: "Analytics", icon: Analytics01Icon },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/settings/account", label: "Account", icon: Settings01Icon }],
  },
];

const adminNavigation: Array<{ label: string; items: NavigationItem[] }> = [
  {
    label: "Administration",
    items: [
      { href: "/admin", label: "Overview", icon: Shield01Icon, exact: true },
      { href: "/admin/reviews", label: "Publishing reviews", icon: Package01Icon },
      { href: "/admin/workflows", label: "Workflow templates", icon: WorkflowSquare01Icon },
      { href: "/admin/reports", label: "Reports", icon: Alert01Icon },
      { href: "/admin/deliveries", label: "Deliveries", icon: WebhookIcon },
      { href: "/admin/history", label: "History", icon: Clock01Icon },
    ],
  },
];

function isActiveRoute(pathname: string, item: NavigationItem) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function DashboardNavigation({
  pathname,
  navigation,
  onNavigate,
}: {
  pathname: string;
  navigation: Array<{ label: string; items: NavigationItem[] }>;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {navigation.map((group) => (
        <div key={group.label}>
          <p className="px-2 pb-2 font-medium text-muted-foreground text-xs">{group.label}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isActiveRoute(pathname, item);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex h-10 items-center gap-3 rounded-lg px-2.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-muted text-foreground",
                  )}
                  href={item.href as Route}
                  key={item.href}
                  onClick={onNavigate}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-md transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground ring-1 ring-border group-hover:text-foreground",
                    )}
                  >
                    <HugeiconsIcon className="size-4" icon={item.icon} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function WorkspaceSwitcher({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const organizations = authClient.useListOrganizations();
  const organizationSlug = pathname.match(/^\/dashboard\/organizations\/([^/]+)/)?.[1];
  const activeOrganization = organizations.data?.find(
    (organization) => organization.slug === organizationSlug,
  );

  async function navigate(href: string, organizationId?: string | null) {
    if (organizationId !== undefined) {
      const result = await authClient.organization.setActive({ organizationId });
      if (result.error) {
        return;
      }
    }
    onNavigate?.();
    router.push(href as Route);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Switch dashboard workspace"
        className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <HugeiconsIcon
            className="size-4"
            icon={activeOrganization ? Building03Icon : Package01Icon}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-sm">
            {activeOrganization?.name ?? "Personal workspace"}
          </span>
          <span className="block truncate text-muted-foreground text-xs">
            {activeOrganization ? "Team workspace" : "Your projects"}
          </span>
        </span>
        <HugeiconsIcon className="size-4 shrink-0 text-muted-foreground" icon={ArrowDown01Icon} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Personal</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => void navigate("/dashboard", null)}>
            <HugeiconsIcon className="text-muted-foreground" icon={Package01Icon} />
            Personal workspace
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {organizations.data && organizations.data.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              {organizations.data.map((organization) => (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() =>
                    void navigate(`/dashboard/organizations/${organization.slug}`, organization.id)
                  }
                >
                  <HugeiconsIcon className="text-muted-foreground" icon={Building03Icon} />
                  <span className="min-w-0 flex-1 truncate">{organization.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarContent({
  pathname,
  navigation,
  workspaceLabel,
  onNavigate,
}: {
  pathname: string;
  navigation: Array<{ label: string; items: NavigationItem[] }>;
  workspaceLabel: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="p-3">
        {workspaceLabel === "Administration" ? (
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon className="size-4" icon={Shield01Icon} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-sm">{workspaceLabel}</p>
              <p className="truncate text-muted-foreground text-xs">BedrockNexus Plugins</p>
            </div>
          </div>
        ) : (
          <WorkspaceSwitcher onNavigate={onNavigate} pathname={pathname} />
        )}
      </div>
      <Separator className="mb-4" />
      <DashboardNavigation navigation={navigation} pathname={pathname} onNavigate={onNavigate} />
      <div className="border-t p-3">
        <Link
          className="flex h-10 items-center gap-3 rounded-lg px-2.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
          href="/"
          onClick={onNavigate}
        >
          <HugeiconsIcon className="size-4" icon={ArrowLeft01Icon} />
          Back to website
        </Link>
      </div>
    </>
  );
}

export function WorkspaceShell({ label, children }: { label: string; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdministration = label === "Administration";
  const navigation = isAdministration ? adminNavigation : dashboardNavigation;
  const workspaceLabel = isAdministration ? "Administration" : "Personal workspace";
  const userButtonLinks: UserButtonLink[] = [
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
  ];

  return (
    <div className="min-h-screen bg-muted/35">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close dashboard navigation" : "Open dashboard navigation"}
            className="lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            size="icon"
            variant="ghost"
          >
            <HugeiconsIcon className="size-5" icon={mobileOpen ? Cancel01Icon : Menu01Icon} />
          </Button>
          <BrandMark imageClassName="w-32 sm:w-36" />
          <Separator className="hidden h-5 sm:block" orientation="vertical" />
          <span className="hidden truncate text-muted-foreground text-sm sm:block">{label}</span>
        </div>
        <UserButton align="end" links={userButtonLinks} size="icon" />
      </header>

      <aside className="fixed top-16 bottom-0 left-0 z-40 hidden w-64 flex-col border-r bg-background lg:flex">
        <SidebarContent
          navigation={navigation}
          pathname={pathname}
          workspaceLabel={workspaceLabel}
        />
      </aside>

      {mobileOpen && (
        <>
          <button
            aria-label="Close dashboard navigation"
            className="fixed inset-0 top-16 z-30 bg-black/45 lg:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          />
          <aside className="fixed top-16 bottom-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r bg-background shadow-2xl lg:hidden">
            <SidebarContent
              navigation={navigation}
              pathname={pathname}
              workspaceLabel={workspaceLabel}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}

      <div className="min-h-screen pt-16 lg:pl-64">
        <main className="mx-auto flex w-full max-w-[96rem] flex-1 flex-col p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
