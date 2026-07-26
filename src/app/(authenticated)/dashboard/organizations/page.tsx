import type { Metadata } from "next";

import { OrganizationsDashboard } from "@/components/organizations/organization-dashboard";

export const metadata: Metadata = {
  title: "Organizations",
  robots: { index: false, follow: false },
};

export default function OrganizationsPage() {
  return <OrganizationsDashboard />;
}
