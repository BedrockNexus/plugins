import { GitBranch } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { publicNavigation, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            GitHub-powered publishing and discovery for the Minecraft Bedrock server ecosystem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
          {publicNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.githubUrl}
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <GitBranch className="size-4" aria-hidden="true" /> GitHub
          </a>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-5 text-center text-xs text-muted-foreground">
        BedrockNexus Plugins is not affiliated with Mojang Studios or Microsoft.
      </div>
    </footer>
  );
}
