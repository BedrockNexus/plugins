import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { publicNavigation, siteConfig } from "@/lib/site";

const columns = [
  {
    title: "Discover",
    links: [
      { href: "/", label: "Home" },
      ...publicNavigation.map((item) => ({ href: item.href, label: item.label })),
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/dashboard/projects/new", label: "Publish a plugin" },
      { href: "/dashboard", label: "Developer dashboard" },
    ],
  },
  {
    title: "Bedrock Nexus",
    links: [
      { href: siteConfig.hubUrl, label: "Servers & projects", external: true },
      { href: siteConfig.githubUrl, label: "GitHub", external: true },
    ],
  },
];

const linkClass = "text-muted-foreground text-sm transition-colors hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className="border-t bg-surface-sunken">
      <div aria-hidden="true" className="strata h-3 border-ember border-b-2" />
      <div className="container mx-auto flex flex-wrap justify-between gap-10 px-4 pt-12 pb-8 md:px-6">
        <div className="flex max-w-sm flex-1 basis-72 flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Image alt="" className="size-11" height={88} src="/icon.png" unoptimized width={88} />
            <span className="font-bold font-display text-xl">Bedrock Nexus Plugins</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Open-source plugins for Minecraft Bedrock servers, built from public GitHub
            repositories. An Amblydia project.
          </p>
        </div>

        <div className="flex flex-wrap gap-14">
          {columns.map((column) => (
            <nav aria-label={column.title} className="flex flex-col gap-2.5" key={column.title}>
              <h2 className="font-bold font-display text-foreground text-xs uppercase tracking-[0.12em]">
                {column.title}
              </h2>
              {column.links.map((link) =>
                "external" in link && link.external ? (
                  <a className={linkClass} href={link.href} key={link.href} rel="noopener">
                    {link.label}
                  </a>
                ) : (
                  <Link className={linkClass} href={link.href as Route} key={link.href}>
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          ))}
        </div>
      </div>
      <div className="container mx-auto flex flex-col gap-2 border-t px-4 py-6 text-muted-foreground text-xs sm:flex-row sm:justify-between md:px-6">
        <p>© {new Date().getFullYear()} BedrockNexus. Open source under AGPL-3.0.</p>
        <p>Not affiliated with Mojang Studios or Microsoft.</p>
      </div>
    </footer>
  );
}
