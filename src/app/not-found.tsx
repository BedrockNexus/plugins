import { Compass } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <Compass className="mx-auto size-8 text-primary" aria-hidden="true" />
        <p className="mt-5 font-mono text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          404
        </p>
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
