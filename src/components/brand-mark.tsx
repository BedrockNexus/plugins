import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label="BedrockNexus Plugins home"
    >
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-[10px] bg-foreground text-background shadow-sm transition-transform group-hover:-rotate-2">
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-primary" aria-hidden="true" />
        <span className="relative font-mono text-sm font-black tracking-[-0.12em]">BN</span>
      </span>
      {!compact && (
        <span className="flex items-baseline gap-1 text-[15px] font-bold tracking-tight">
          <span>BedrockNexus</span>
          <span className="text-primary">Plugins</span>
        </span>
      )}
    </Link>
  );
}
