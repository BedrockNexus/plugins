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
    <main className="flex w-full flex-1 flex-col">
      <header className="border-b bg-surface-sunken">
        <div className="container mx-auto flex flex-col gap-4 px-4 pt-10 pb-8 md:flex-row md:items-end md:justify-between md:px-6">
          <div className="max-w-3xl">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            <h1 className="text-balance font-bold text-[clamp(2rem,4vw,3rem)] leading-none">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-[17px] text-muted-foreground">{description}</p>
          </div>
          {actions}
        </div>
      </header>
      <div className={cn("container mx-auto w-full px-4 pt-8 pb-16 md:px-6", className)}>
        {children}
      </div>
    </main>
  );
}
