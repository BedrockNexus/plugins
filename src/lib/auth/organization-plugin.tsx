import { createAuthPlugin } from "@better-auth-ui/core";
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationLocalization,
  type OrganizationPluginOptions,
} from "@better-auth-ui/core/plugins";
import { Briefcase01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { OrganizationsSettings } from "@/components/auth/organization/organizations-settings";

export const organizationPlugin = createAuthPlugin(
  coreOrganizationPlugin.id,
  (options: OrganizationPluginOptions = {}) => {
    const core = coreOrganizationPlugin(options);

    return {
      ...core,
      localization: core.localization as OrganizationLocalization,
      settingsTabs: [
        {
          view: "organizations",
          label: (
            <>
              <HugeiconsIcon className="text-muted-foreground" icon={Briefcase01Icon} />
              {core.localization.organizations}
            </>
          ),
          component: OrganizationsSettings,
        },
      ],
    };
  },
);
