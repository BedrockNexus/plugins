import { CheckmarkCircle02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PrototypeBanner({
  children = "This screen demonstrates the planned experience. Its records and actions are illustrative and are not connected to production data.",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex gap-3 rounded-xl border border-primary bg-primary px-4 py-3 text-primary-foreground">
      <HugeiconsIcon className="mt-0.5 size-5 shrink-0" icon={InformationCircleIcon} />
      <div>
        <p className="font-semibold text-sm">Interface prototype</p>
        <div className="mt-0.5 text-sm leading-6 opacity-80">{children}</div>
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="shadow-none">
      <CardContent>
        <p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.14em]">
          {label}
        </p>
        <p className="mt-3 font-semibold text-2xl tracking-tight">{value}</p>
        <p className="mt-1 text-muted-foreground text-xs">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function PrototypeStatusList({
  items,
  className,
}: {
  items: ReadonlyArray<{
    icon: IconSvgElement;
    label: string;
    value: string;
    status?: string;
  }>;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-none", className)}>
      <CardContent className="divide-y">
        {items.map((item) => (
          <div className="flex items-center gap-3 py-4 first:pt-0 last:pb-0" key={item.label}>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon className="size-4.5" icon={item.icon} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs">{item.label}</p>
              <p className="mt-0.5 truncate font-medium text-sm">{item.value}</p>
            </div>
            {item.status && <Badge variant="outline">{item.status}</Badge>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PrototypeTimeline({
  items,
}: {
  items: ReadonlyArray<{
    title: string;
    description: string;
    status: "complete" | "current" | "pending";
  }>;
}) {
  return (
    <ol className="space-y-0">
      {items.map((item, index) => (
        <li className="relative grid grid-cols-[auto_1fr] gap-4 pb-7 last:pb-0" key={item.title}>
          {index < items.length - 1 && (
            <span className="absolute top-8 bottom-0 left-[0.9375rem] w-px bg-border" />
          )}
          <span
            className={cn(
              "relative z-10 grid size-8 place-items-center rounded-full border bg-background",
              item.status === "complete" && "border-primary bg-primary text-primary-foreground",
              item.status === "current" && "border-primary ring-4 ring-primary/20",
            )}
          >
            {item.status === "complete" ? (
              <HugeiconsIcon className="size-4" icon={CheckmarkCircle02Icon} />
            ) : (
              <span
                className={cn("size-2 rounded-full", item.status === "current" && "bg-primary")}
              />
            )}
          </span>
          <div className="pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-sm">{item.title}</p>
              <Badge variant={item.status === "current" ? "accent" : "outline"}>
                {item.status}
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground text-sm leading-6">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function PrototypeSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-muted-foreground text-sm">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PrototypeFeatureCard({
  icon,
  title,
  description,
  footer,
}: {
  icon: IconSvgElement;
  title: string;
  description: string;
  footer?: ReactNode;
}) {
  return (
    <Card className="h-full shadow-none">
      <CardHeader>
        <span className="mb-4 grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
          <HugeiconsIcon className="size-5" icon={icon} />
        </span>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="leading-6">{description}</CardDescription>
      </CardHeader>
      {footer && <CardContent className="mt-auto border-t pt-5">{footer}</CardContent>}
    </Card>
  );
}
