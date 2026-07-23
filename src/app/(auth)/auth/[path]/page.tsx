import { viewPaths } from "@better-auth-ui/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Auth } from "@/components/auth/auth";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const enabledAuthPaths = [viewPaths.auth.signIn, viewPaths.auth.signOut] as string[];

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  if (!enabledAuthPaths.includes(path)) {
    notFound();
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 md:p-6">
      <div className="site-grid absolute inset-0 -z-20" />
      <div className="absolute -top-48 right-0 -z-10 size-120 rounded-full bg-primary/20 blur-3xl" />
      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_28rem]">
        <section className="hidden max-w-lg lg:block">
          <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]">
            <span className="size-2 bg-primary" />
            Developer access
          </p>
          <h1 className="text-balance font-bold text-5xl tracking-[-0.04em]">
            Your publishing workspace starts with GitHub.
          </h1>
          <p className="mt-5 text-muted-foreground leading-7">
            Sign in with the account that owns or maintains your public plugin repositories. Your
            GitHub identity remains separate from the main BedrockNexus platform.
          </p>
        </section>
        <div className="flex w-full flex-col items-center gap-8">
          <BrandMark imageClassName="w-64" />
          <Auth className="max-w-md shadow-xl shadow-black/10" path={path} socialPosition="top" />
        </div>
      </div>
    </main>
  );
}
