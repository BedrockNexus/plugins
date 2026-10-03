import type { Metadata } from "next";

import { Auth } from "@/components/auth/auth";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "Logout",
  robots: { index: false, follow: false },
};

export default function LogoutPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 md:p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <BrandMark imageClassName="w-64" />
        <Auth className="min-h-48" view="signOut" />
      </div>
    </main>
  );
}
