import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace-shell";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell label="Developer workspace">{children}</WorkspaceShell>;
}
