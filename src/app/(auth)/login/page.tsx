import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Auth } from "@/components/auth/auth";
import { BrandMark } from "@/components/brand-mark";
import { isAuthenticated } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 md:p-6">
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
            Continue with the account that owns or maintains your public plugin repositories. New
            users are registered automatically on their first GitHub login.
          </p>
        </section>
        <div className="flex w-full flex-col items-center gap-8">
          <BrandMark imageClassName="w-64" />
          <Auth className="max-w-md shadow-xl shadow-black/10" view="signIn" socialPosition="top" />
        </div>
      </div>
    </main>
  );
}
