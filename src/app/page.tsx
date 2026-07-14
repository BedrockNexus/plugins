import { product } from "@/lib/foundation";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-12">
        <p className="text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-400">
          Production foundation
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{product.name}</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          {product.tagline}
        </p>
        <div className="mt-8 rounded-2xl bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100">
          Phase 0 establishes the clean Next.js foundation. Product UI and integrations are
          implemented in the ordered phases in TODO.md.
        </div>
      </section>
    </main>
  );
}
