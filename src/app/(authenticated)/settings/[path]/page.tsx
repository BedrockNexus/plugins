import { viewPaths } from "@better-auth-ui/core";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

const enabledSettingsPaths = [viewPaths.settings.account, viewPaths.settings.security] as string[];

export default async function SettingsPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  if (path === "organizations") {
    redirect("/dashboard/organizations" as Route);
  }

  if (!enabledSettingsPaths.includes(path)) {
    notFound();
  }

  redirect(
    (path === viewPaths.settings.security
      ? "/dashboard/settings/providers"
      : "/dashboard/settings/profile") as Route,
  );
}
