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
      new URL("/auth/sign-in?redirectTo=/dashboard/repositories", request.url),
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
      new URL("/dashboard/repositories?github=invalid-callback", request.url),
    );
  }

  try {
    await fetchAuthMutation(api.users.syncCurrentUser, {});
    const result = await fetchAuthAction(api.github.actions.completeInstallation, {
      code,
      state,
      installationId,
    });
    const destination = new URL("/dashboard/repositories", request.url);
    destination.searchParams.set("github", "connected");
    destination.searchParams.set("account", result.accountLogin);
    return NextResponse.redirect(destination);
  } catch (error) {
    console.error("GitHub App installation callback failed.", error);
    return NextResponse.redirect(
      new URL("/dashboard/repositories?github=connection-failed", request.url),
    );
  }
}
