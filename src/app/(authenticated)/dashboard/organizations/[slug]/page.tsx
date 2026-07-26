import type { Metadata } from "next";

import { OrganizationWorkspace } from "@/components/organizations/organization-dashboard";

export const metadata: Metadata = {
  title: "Organization workspace",
  robots: { index: false, follow: false },
};

export default async function OrganizationWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <OrganizationWorkspace slug={slug} />;
}
