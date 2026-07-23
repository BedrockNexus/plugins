import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  className,
  imageClassName,
}: {
  compact?: boolean;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex w-fit items-center gap-2.5 rounded-md", className)}
      aria-label="BedrockNexus Plugins home"
    >
      <Image
        alt="BedrockNexus"
        className={cn("h-auto w-44 object-contain", imageClassName)}
        height={905}
        priority
        src="/images/bedrocknexus-logo.png"
        width={2000}
      />
      {!compact && (
        <span className="rounded-md bg-primary px-2 py-1 font-semibold text-[11px] text-primary-foreground uppercase tracking-wider">
          Plugins
        </span>
      )}
    </Link>
  );
}
