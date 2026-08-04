import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganizationWorkspace } from "@/components/organizations/organization-dashboard";

export const metadata: Metadata = {
  title: "Organization workspace",
  robots: { index: false, follow: false },
};

const organizationPaths = new Set(["settings", "members"]);

export default async function OrganizationWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string; path: string }>;
}) {
  const { slug, path } = await params;

  if (!organizationPaths.has(path)) {
    notFound();
  }

  return <OrganizationWorkspace path={path} slug={slug} />;
}
