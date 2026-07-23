import { HugeiconsIcon } from "@hugeicons/react";
import { CompassIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
          <HugeiconsIcon icon={CompassIcon} className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-5 font-mono text-xs font-semibold tracking-[0.18em] uppercase">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          That route is outside the registry
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page may have moved or is not available yet.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-7" })}>
          Return home
        </Link>
      </div>
    </main>
  );
}
