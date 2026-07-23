import { viewPaths } from "@better-auth-ui/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Settings } from "@/components/auth/settings/settings";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};

const enabledSettingsPaths = [viewPaths.settings.account, viewPaths.settings.security] as string[];

export default async function SettingsPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  if (!enabledSettingsPaths.includes(path)) {
    notFound();
  }

  const isSecurity = path === viewPaths.settings.security;

  return (
    <PageShell
      className="max-w-5xl"
      eyebrow="Workspace preferences"
      title={isSecurity ? "Security settings" : "Account settings"}
      description={
        isSecurity
          ? "Review active sessions and keep access to your publishing workspace secure."
          : "Manage the identity and profile details connected to your developer workspace."
      }
    >
      <Settings path={path} />
    </PageShell>
  );
}
