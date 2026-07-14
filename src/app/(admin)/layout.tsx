import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell label="Administration">{children}</WorkspaceShell>;
}
