import type { Route } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/../convex/_generated/api";
import { WorkspaceShell } from "@/components/workspace-shell";
import { fetchAuthMutation, isAuthenticated } from "@/lib/auth-server";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/auth/sign-in?redirectTo=/dashboard" as Route);
  }

  await fetchAuthMutation(api.functions.site.users.syncCurrentUser, {});

  return <WorkspaceShell label="Developer workspace">{children}</WorkspaceShell>;
}
