import type { Route } from "next";
import { redirect } from "next/navigation";

export default function PublishPage() {
  redirect("/dashboard/projects/new" as Route);
}
