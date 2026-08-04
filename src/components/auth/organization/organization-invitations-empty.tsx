"use client";

import { useAuthPlugin } from "@better-auth-ui/react";
import { SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { organizationPlugin } from "@/lib/auth/organization-plugin";

export type OrganizationInvitationsEmptyProps = {
  onInvitePress: () => void;
};

/**
 * Empty state for `OrganizationInvitations`.
 */
export function OrganizationInvitationsEmpty({ onInvitePress }: OrganizationInvitationsEmptyProps) {
  const { localization: organizationLocalization } = useAuthPlugin(organizationPlugin);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={SentIcon} />
        </EmptyMedia>
        <EmptyTitle>{organizationLocalization.noInvitations}</EmptyTitle>
        <EmptyDescription>
          {organizationLocalization.organizationInvitationsEmptyDescription}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" onClick={onInvitePress}>
          {organizationLocalization.inviteMember}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
