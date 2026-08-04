import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

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
  redirect(`/dashboard/organizations/${encodeURIComponent(slug)}/settings` as Route);
}
