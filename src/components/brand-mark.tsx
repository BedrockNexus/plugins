import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  className,
  imageClassName,
  withIcon = false,
}: {
  compact?: boolean;
  className?: string;
  imageClassName?: string;
  /** Show the block icon before the wordmark, as on bedrocknexus.com. */
  withIcon?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex w-fit shrink-0 items-center gap-2 rounded-sm", className)}
      aria-label="BedrockNexus Plugins home"
    >
      {withIcon ? (
        <Image
          alt=""
          className="-mr-2 size-10 object-contain"
          height={80}
          priority
          src="/icon.png"
          unoptimized
          width={80}
        />
      ) : null}
      <Image
        alt="BedrockNexus"
        className={cn("h-auto w-44 object-contain", imageClassName)}
        height={905}
        priority
        src="/images/bedrocknexus-logo.png"
        unoptimized
        width={2000}
      />
      {!compact && (
        <span className="rounded-sm border-2 border-edge bg-primary px-1.5 py-0.5 font-bold font-display text-[11px] text-primary-foreground uppercase tracking-wider shadow-[0_2px_0_var(--extrude)]">
          Plugins
        </span>
      )}
    </Link>
  );
}
