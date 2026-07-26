import type { Metadata } from "next";

import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { PublishingReviewQueue } from "@/components/publishing/publishing-review-queue";

export const metadata: Metadata = {
  title: "Publishing reviews",
  robots: { index: false, follow: false },
};

export default function PublishingReviewsPage() {
  return (
    <DashboardPageShell
      eyebrow="Moderation"
      title="Publishing reviews"
      description="Review the exact verified release, repository, workflow correlation, asset, and metadata before making a project public."
    >
      <PublishingReviewQueue />
    </DashboardPageShell>
  );
}
