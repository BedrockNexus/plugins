import { NextResponse } from "next/server";

import { api } from "@/../convex/_generated/api";
import { fetchAuthAction, fetchAuthMutation, isAuthenticated } from "@/lib/auth-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const installationIdValue = url.searchParams.get("installation_id");
  const installationId = Number(installationIdValue);

  if (!(await isAuthenticated())) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?redirectTo=/dashboard/projects/new", request.url),
    );
  }

  if (
    !code ||
    !state ||
    !installationIdValue ||
    !Number.isSafeInteger(installationId) ||
    installationId <= 0
  ) {
    return NextResponse.redirect(
      new URL("/dashboard/projects?github=invalid-callback", request.url),
    );
  }

  try {
    await fetchAuthMutation(api.functions.site.users.syncCurrentUser, {});
    const result = await fetchAuthAction(api.functions.github.actions.completeInstallation, {
      code,
      state,
      installationId,
    });
    const destination = new URL("/dashboard/projects", request.url);
    destination.searchParams.set("github", "connected");
    destination.searchParams.set("account", result.accountLogin);
    return NextResponse.redirect(destination);
  } catch (error) {
    console.error("GitHub App installation callback failed.", error);
    return NextResponse.redirect(
      new URL("/dashboard/projects?github=connection-failed", request.url),
    );
  }
}
