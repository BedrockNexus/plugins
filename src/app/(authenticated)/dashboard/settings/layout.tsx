import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function DashboardSettingsLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl">{children}</div>;
}
