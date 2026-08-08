"use client";

import { useAuth, useSession } from "@better-auth-ui/react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountIdentity() {
  const { authClient } = useAuth();
  const { data: session } = useSession(authClient);

  return (
    <div>
      <h2 className="mb-3 font-semibold text-sm">Account identity</h2>
      <Card className="shadow-none">
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm">Sign-in provider</p>
              <p className="mt-1 text-muted-foreground text-xs">
                BedrockNexus Plugins uses GitHub as the account identity provider.
              </p>
            </div>
            <Badge variant="outline">GitHub</Badge>
          </div>
          <div className="border-t pt-5">
            <p className="font-medium text-sm">Account email</p>
            {session ? (
              <p className="mt-1 text-muted-foreground text-sm">{session.user.email}</p>
            ) : (
              <Skeleton className="mt-2 h-5 w-56" />
            )}
          </div>
          <p className="rounded-lg border bg-muted p-3 text-muted-foreground text-xs leading-5">
            Profile details, email, password, recovery, and connected-account access are managed by
            GitHub. BedrockNexus Plugins does not maintain a separate editable identity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
