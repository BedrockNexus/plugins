import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 sm:py-16 lg:px-8",
        className,
      )}
    >
      <header className="flex flex-col gap-6 border-b border-border/70 pb-9 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-3 font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>
        {actions}
      </header>
      <div className="py-10">{children}</div>
    </main>
  );
}
