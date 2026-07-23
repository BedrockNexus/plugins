import { HugeiconsIcon } from "@hugeicons/react";
import { GitBranchIcon, LinkSquare01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { publicNavigation, siteConfig } from "@/lib/site";

const platformLinks = [
  { href: "/dashboard", label: "Developer dashboard", external: false },
  { href: siteConfig.githubUrl, label: "GitHub repository", external: true },
  { href: siteConfig.hubUrl, label: "Main BedrockNexus platform", external: true },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted">
      <div className="container mx-auto px-4 py-14 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
          <div className="flex flex-col gap-5">
            <BrandMark imageClassName="w-64" />
            <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
              GitHub-powered publishing and discovery for the Minecraft Bedrock server ecosystem.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-foreground text-xs uppercase tracking-widest">
              Explore
            </h2>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                  href="/"
                >
                  Home
                </Link>
              </li>
              {publicNavigation.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-foreground text-xs uppercase tracking-widest">
              Platform
            </h2>
            <ul className="flex flex-col gap-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
                      href={link.href}
                    >
                      {link.label}
                      {link.href === siteConfig.githubUrl ? (
                        <HugeiconsIcon
                          icon={GitBranchIcon}
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={LinkSquare01Icon}
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      )}
                    </a>
                  ) : (
                    <Link
                      className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} BedrockNexus. All rights reserved.
          </p>
          <p className="text-muted-foreground/60 text-xs">
            Not affiliated with Mojang Studios or Microsoft.
          </p>
        </div>
      </div>
    </footer>
  );
}
