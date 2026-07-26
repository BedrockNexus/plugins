"use client";

import { organizationPlugin } from "@better-auth-ui/core/plugins";
import type { AuthClient } from "@better-auth-ui/react";
import type { AuthClient as ConvexAuthClient } from "@convex-dev/better-auth/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import type { Route } from "next";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from "react";

import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/query-client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is required.");
}

const convex = new ConvexReactClient(convexUrl);

type AuthLinkProps = PropsWithChildren<
  { className?: string; href: string; to?: string } & Pick<
    ComponentPropsWithoutRef<"a">,
    "aria-disabled" | "onClick" | "tabIndex"
  >
>;

function AuthLink({ href, to: _to, ...props }: AuthLinkProps) {
  return <NextLink {...props} href={href as Route} />;
}

function getOrganizationSlug(pathname: string) {
  const [dashboard, organizations, slug] = pathname.split("/").filter(Boolean);
  return dashboard === "dashboard" && organizations === "organizations" ? (slug ?? null) : null;
}

export function Providers({
  children,
  initialToken,
}: {
  children: ReactNode;
  initialToken?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = getQueryClient();
  const organizationSlug = getOrganizationSlug(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <ConvexBetterAuthProvider
        client={convex}
        authClient={authClient as unknown as ConvexAuthClient}
        initialToken={initialToken}
      >
        <AuthProvider
          authClient={authClient as unknown as AuthClient}
          emailAndPassword={{ enabled: false }}
          plugins={[
            organizationPlugin({
              slug: organizationSlug,
              viewPaths: {
                organization: {
                  settings: "settings",
                  people: "members",
                },
              },
            }),
          ]}
          basePaths={{
            auth: "/auth",
            settings: "/settings",
            organization: "/dashboard/organizations",
          }}
          multipleAccountsPerProvider={false}
          redirectTo="/dashboard"
          socialProviders={["github"]}
          navigate={({ to, replace }) =>
            replace ? router.replace(to as Route) : router.push(to as Route)
          }
          Link={AuthLink}
        >
          {children}
          <Toaster />
        </AuthProvider>
      </ConvexBetterAuthProvider>
    </QueryClientProvider>
  );
}
