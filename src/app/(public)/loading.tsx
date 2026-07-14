import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8" aria-busy="true">
      <span className="sr-only">Loading page</span>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-5 h-12 max-w-xl" />
      <Skeleton className="mt-4 h-6 max-w-2xl" />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-56 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
