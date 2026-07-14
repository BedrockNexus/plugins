import { ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export function WorkspaceShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/35">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <BrandMark />
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
            <span className="hidden text-sm font-medium text-muted-foreground sm:block">
              {label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="hidden gap-1.5 sm:inline-flex">
              <Construction aria-hidden="true" /> Foundation preview
            </Badge>
            <ThemeToggle />
            <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <ArrowLeft aria-hidden="true" /> Home
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
