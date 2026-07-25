import type { Route } from "next";
import { NextResponse } from "next/server";

import { api } from "@/../convex/_generated/api";
import { fetchAuthAction, fetchAuthMutation, isAuthenticated } from "@/lib/auth-server";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?redirectTo=/dashboard/repositories" as Route, request.url),
    );
  }

  try {
    await fetchAuthMutation(api.users.syncCurrentUser, {});
    const { url } = await fetchAuthAction(api.github.actions.createInstallUrl, {});
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/repositories?github=configuration-error", request.url),
    );
  }
}
