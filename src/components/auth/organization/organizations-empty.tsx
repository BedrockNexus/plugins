"use client";

import { useAuthPlugin } from "@better-auth-ui/react";
import { Briefcase01Icon } from "@hugeicons/core-free-icons";
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

export type OrganizationsEmptyProps = {
  onCreatePress: () => void;
};

export function OrganizationsEmpty({ onCreatePress }: OrganizationsEmptyProps) {
  const { localization: organizationLocalization } = useAuthPlugin(organizationPlugin);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Briefcase01Icon} />
        </EmptyMedia>
        <EmptyTitle>{organizationLocalization.noOrganizations}</EmptyTitle>
        <EmptyDescription>{organizationLocalization.organizationsDescription}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" onClick={onCreatePress}>
          {organizationLocalization.createOrganization}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
