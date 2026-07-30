import { DangerZone } from "@/components/auth/delete-user/danger-zone";
import { AccountIdentity } from "@/components/dashboard-settings/account-identity";

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <AccountIdentity />
      <DangerZone />
    </div>
  );
}
