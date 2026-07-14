import { GitBranch, Menu } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { publicNavigation, siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandMark />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <a
            href={siteConfig.githubUrl}
            aria-label="BedrockNexus Plugins on GitHub"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "hidden sm:inline-flex",
            })}
          >
            <GitBranch aria-hidden="true" />
          </a>
          <ThemeToggle />
          <Link
            href="/dashboard"
            className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}
          >
            Developer dashboard
          </Link>
          <details className="relative md:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-accent [&::-webkit-details-marker]:hidden">
              <Menu className="size-4" aria-hidden="true" />
              <span className="sr-only">Open navigation</span>
            </summary>
            <nav
              className="absolute right-0 top-12 grid min-w-48 gap-1 rounded-xl border bg-popover p-2 text-popover-foreground shadow-xl"
              aria-label="Mobile navigation"
            >
              {publicNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Developer dashboard
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
