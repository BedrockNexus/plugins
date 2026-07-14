import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed bg-card/55">
      <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
        <span className="mb-5 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  );
}
