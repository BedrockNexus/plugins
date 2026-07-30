import type { Route } from "next";
import { redirect } from "next/navigation";

export default function DashboardSettingsPage() {
  redirect("/dashboard/settings/profile" as Route);
}
