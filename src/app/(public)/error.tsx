"use client";
import { Alert01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto grid min-h-[65vh] max-w-7xl place-items-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <HugeiconsIcon icon={Alert01Icon} className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">This page hit an unexpected error</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Retry the route. No publishing state was changed.
        </p>
        <Button type="button" className="mt-6" onClick={unstable_retry}>
          Try again
        </Button>
      </div>
    </main>
  );
}
