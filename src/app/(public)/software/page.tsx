import { ArrowRight, Box } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { softwareCatalog } from "@/lib/site";

export const metadata: Metadata = {
  title: "Server software",
  description: "Browse Minecraft Bedrock server software supported by BedrockNexus Plugins.",
  alternates: { canonical: "/software" },
};

export default function SoftwarePage() {
  return (
    <PageShell
      eyebrow="Adapter directory"
      title="Server software"
      description="Each ecosystem is supported through an isolated adapter for detection, workflow generation, and release validation."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {softwareCatalog.map((software) => (
          <Link
            key={software.slug}
            href={`/software/${software.slug}`}
            className="group rounded-2xl"
          >
            <Card className="h-full transition-[transform,border-color] group-hover:-translate-y-1 group-hover:border-primary/35">
              <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-4">
                <span className="row-span-2 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Box className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="col-start-2 text-lg">{software.name}</CardTitle>
                <CardDescription className="col-start-2">
                  {software.language} · {software.format}
                </CardDescription>
                <Badge variant="outline" className="col-start-3 row-start-1">
                  {software.status}
                </Badge>
                <ArrowRight className="col-start-3 row-start-2 size-4 justify-self-end text-muted-foreground transition-transform group-hover:translate-x-1" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
