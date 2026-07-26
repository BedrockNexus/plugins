import { ArrowRight01Icon, Package01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Server software",
  description: "Browse Minecraft Bedrock server software supported by BedrockNexus Plugins.",
  alternates: { canonical: "/software" },
};

export default async function SoftwarePage() {
  const software = await fetchQuery(api.functions.site.catalog.listSoftware, {});

  return (
    <PageShell
      eyebrow="Adapter directory"
      title="Server software"
      description="Browse every live publishing adapter and the public projects built for its ecosystem."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {software.map((item) => (
          <Link key={item.slug} href={`/software/${item.slug}`} className="group rounded-xl">
            <Card className="h-full transition-[transform,border-color] group-hover:-translate-y-1 group-hover:border-primary">
              <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-4">
                <span className="row-span-2 grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={Package01Icon} className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="col-start-2 text-lg">{item.name}</CardTitle>
                <CardDescription className="col-start-2 line-clamp-1">
                  {item.description}
                </CardDescription>
                <Badge variant="outline" className="col-start-3 row-start-1">
                  {item.projectCount} {item.projectCount === 1 ? "project" : "projects"}
                </Badge>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="col-start-3 row-start-2 size-4 justify-self-end text-muted-foreground transition-transform group-hover:translate-x-1"
                />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
