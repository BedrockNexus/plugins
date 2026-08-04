"use client";

import {
  type OrganizationAuthClient,
  useAcceptInvitation,
  useAuth,
  useAuthPlugin,
  useRejectInvitation,
} from "@better-auth-ui/react";
import { Cancel01Icon, Clock01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Invitation } from "better-auth/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { organizationPlugin } from "@/lib/auth/organization-plugin";

export type UserInvitationRowProps = {
  invitation: Invitation & { organizationName?: string };
};

/**
 * Single invitation row with accept/reject actions for the current user.
 */
export function UserInvitationRow({ invitation }: UserInvitationRowProps) {
  const { authClient } = useAuth();
  const { localization: organizationLocalization, roles } = useAuthPlugin(organizationPlugin);

  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation(
    authClient as OrganizationAuthClient,
  );

  const { mutate: rejectInvitation, isPending: isRejecting } = useRejectInvitation(
    authClient as OrganizationAuthClient,
  );

  return (
    <Item>
      <ItemMedia variant="icon">
        <HugeiconsIcon icon={Clock01Icon} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {invitation.organizationName}
          <Badge variant="secondary">{roles?.[invitation.role] ?? invitation.role}</Badge>
        </ItemTitle>
        <ItemDescription>
          {new Date(invitation.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="outline"
          size="sm"
          disabled={isAccepting || isRejecting}
          onClick={() => acceptInvitation({ invitationId: invitation.id })}
        >
          {isAccepting ? <Spinner /> : <HugeiconsIcon icon={Tick01Icon} />}

          {organizationLocalization.accept}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="size-8 text-destructive"
          disabled={isAccepting || isRejecting}
          onClick={() => rejectInvitation({ invitationId: invitation.id })}
          aria-label={organizationLocalization.rejectInvitation}
        >
          {isRejecting ? <Spinner /> : <HugeiconsIcon icon={Cancel01Icon} />}
        </Button>
      </ItemActions>
    </Item>
  );
}
