"use client";

import { useAuthPlugin } from "@better-auth-ui/react";
import { SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { organizationPlugin } from "@/lib/auth/organization-plugin";

/**
 * Empty state for `UserInvitations`.
 */
export function UserInvitationsEmpty() {
  const { localization: organizationLocalization } = useAuthPlugin(organizationPlugin);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={SentIcon} />
        </EmptyMedia>
        <EmptyTitle>{organizationLocalization.noInvitations}</EmptyTitle>
        <EmptyDescription>
          {organizationLocalization.userInvitationsEmptyDescription}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
