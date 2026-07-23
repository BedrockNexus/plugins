import type { ReactNode } from "react";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { WorkspaceShell } from "@/components/workspace-shell";
import { api } from "@/../convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/auth/sign-in?redirectTo=/admin" as Route);
  }

  await fetchAuthMutation(api.users.syncCurrentUser, {});

  let authorized = false;

  try {
    await fetchAuthQuery(api.admin.getAccess, {});
    authorized = true;
  } catch {
    authorized = false;
  }

  if (!authorized) {
    redirect("/dashboard?access=denied");
  }

  return <WorkspaceShell label="Administration">{children}</WorkspaceShell>;
}
