"use client";

import {
  AccountSetting01Icon,
  Alert01Icon,
  Analytics01Icon,
  ArrowLeft01Icon,
  Building03Icon,
  Clock01Icon,
  ComputerIcon,
  DashboardBrowsingIcon,
  Package01Icon,
  Settings01Icon,
  Shield01Icon,
  UserIcon,
  WebhookIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { OrganizationSwitcher } from "@/components/auth/organization/organization-switcher";
import { UserButton, type UserButtonLink } from "@/components/auth/user/user-button";
import { BrandMark } from "@/components/brand-mark";
import { SidebarNav, type SidebarNavItem } from "@/components/sidebar/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNavigation: SidebarNavItem[] = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: DashboardBrowsingIcon,
    exactMatch: true,
  },
];

const manageNavigation: SidebarNavItem[] = [
  { title: "Projects", url: "/dashboard/projects", icon: Package01Icon },
  { title: "Organizations", url: "/dashboard/organizations", icon: Building03Icon },
  { title: "Analytics", url: "/dashboard/analytics", icon: Analytics01Icon },
];

const settingsNavigation: SidebarNavItem[] = [
  { title: "Profile", url: "/dashboard/settings/profile", icon: UserIcon },
  { title: "Account", url: "/dashboard/settings/account", icon: AccountSetting01Icon },
  { title: "Sessions", url: "/dashboard/settings/sessions", icon: ComputerIcon },
];

const adminNavigation: SidebarNavItem[] = [
  { title: "Overview", url: "/admin", icon: Shield01Icon, exactMatch: true },
  { title: "Publishing reviews", url: "/admin/reviews", icon: Package01Icon },
  { title: "Workflow templates", url: "/admin/workflows", icon: WorkflowSquare01Icon },
  { title: "Reports", url: "/admin/reports", icon: Alert01Icon },
  { title: "Deliveries", url: "/admin/deliveries", icon: WebhookIcon },
  { title: "History", url: "/admin/history", icon: Clock01Icon },
];

function WorkspaceSwitcher() {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <OrganizationSwitcher
      align="start"
      className="w-full justify-start overflow-hidden group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>div:first-child>div:last-child]:hidden group-data-[collapsible=icon]:[&>div:first-child]:gap-0 group-data-[collapsible=icon]:[&>svg]:hidden"
      setActive={(organization) => {
        if (isMobile) setOpenMobile(false);
        router.push(
          organization ? `/dashboard/organizations/${organization.slug}/settings` : "/dashboard",
        );
      }}
      side="right"
      sideOffset={8}
    />
  );
}

function AdministrationHeader() {
  return (
    <div className="flex h-10 items-center gap-3 rounded-md border bg-card px-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <HugeiconsIcon className="size-4" icon={Shield01Icon} />
      </span>
      <div className="min-w-0 group-data-[collapsible=icon]:hidden">
        <p className="truncate font-semibold text-sm">Administration</p>
        <p className="truncate text-muted-foreground text-xs">BedrockNexus Plugins</p>
      </div>
    </div>
  );
}

function ProjectNavigation({ draftId }: { draftId: string }) {
  const baseUrl = `/dashboard/projects/${encodeURIComponent(draftId)}`;
  return (
    <>
      <SidebarNav
        groupLabel="Project"
        items={[{ title: "Back to projects", url: "/dashboard/projects", icon: ArrowLeft01Icon }]}
      />
      <SidebarNav
        groupLabel="Manage"
        items={[
          { title: "Overview", url: baseUrl, icon: Package01Icon, exactMatch: true },
          { title: "Releases", url: `${baseUrl}/releases`, icon: Clock01Icon },
          { title: "Workflow", url: `${baseUrl}/workflow`, icon: WorkflowSquare01Icon },
        ]}
      />
    </>
  );
}

function OrganizationNavigation({ slug }: { slug: string }) {
  const baseUrl = `/dashboard/organizations/${encodeURIComponent(slug)}`;
  return (
    <>
      <SidebarNav
        groupLabel="Organization"
        items={[
          {
            title: "Back to organizations",
            url: "/dashboard/organizations",
            icon: ArrowLeft01Icon,
          },
        ]}
      />
      <SidebarNav
        groupLabel="Manage"
        items={[
          { title: "Settings", url: `${baseUrl}/settings`, icon: Settings01Icon },
          { title: "Members", url: `${baseUrl}/members`, icon: Building03Icon },
        ]}
      />
    </>
  );
}

function DashboardSidebar({ administration }: { administration: boolean }) {
  const pathname = usePathname();
  const projectMatch = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  const organizationMatch = pathname.match(/^\/dashboard\/organizations\/([^/]+)/);
  const projectId = projectMatch?.[1] === "new" ? undefined : projectMatch?.[1];

  return (
    <Sidebar className="top-16 h-[calc(100svh-4rem)]" collapsible="icon" variant="floating">
      <SidebarHeader>
        {administration ? <AdministrationHeader /> : <WorkspaceSwitcher />}
      </SidebarHeader>
      <SidebarContent>
        {administration ? (
          <SidebarNav groupLabel="Administration" items={adminNavigation} />
        ) : projectId ? (
          <ProjectNavigation draftId={decodeURIComponent(projectId)} />
        ) : organizationMatch?.[1] ? (
          <OrganizationNavigation slug={decodeURIComponent(organizationMatch[1])} />
        ) : (
          <>
            <SidebarNav groupLabel="Dashboard" items={mainNavigation} />
            <SidebarNav groupLabel="Manage" items={manageNavigation} />
            <SidebarNav groupLabel="Settings" items={settingsNavigation} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />} tooltip="Back to website">
              <HugeiconsIcon icon={ArrowLeft01Icon} />
              <span>Back to website</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function WorkspaceShell({ label, children }: { label: string; children: ReactNode }) {
  const administration = label === "Administration";
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
    <SidebarProvider className="pt-16">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <BrandMark imageClassName="w-32 sm:w-36" />
          <Separator className="hidden h-5 sm:block" orientation="vertical" />
          <span className="hidden truncate text-muted-foreground text-sm sm:block">{label}</span>
        </div>
        <UserButton align="end" links={userButtonLinks} size="icon" />
      </header>

      <DashboardSidebar administration={administration} />
      <SidebarInset>
        <div className="mx-auto flex w-full max-w-[96rem] flex-1 flex-col p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
