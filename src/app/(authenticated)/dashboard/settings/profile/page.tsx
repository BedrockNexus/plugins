import { UserProfile } from "@/components/auth/settings/account/user-profile";
import { CreatorProfileForm } from "@/components/dashboard-settings/creator-profile-form";

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-4">
      <UserProfile />
      <CreatorProfileForm />
    </div>
  );
}
