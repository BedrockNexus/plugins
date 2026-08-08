"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type SidebarNavItem = {
  title: string;
  url: string;
  icon: IconSvgElement;
  exactMatch?: boolean;
};

export function SidebarNav({ groupLabel, items }: { groupLabel: string; items: SidebarNavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = item.exactMatch
              ? pathname === item.url
              : pathname === item.url || pathname.startsWith(`${item.url}/`);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  isActive={active}
                  render={<Link href={item.url as Route} />}
                  tooltip={item.title}
                >
                  <HugeiconsIcon icon={item.icon} />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
