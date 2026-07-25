import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { adminMutation } from "./lib/authorization";
import { assertNormalizedSlug } from "./lib/slugs";
import { serverSoftwareValidator } from "./schema";

const defaultSoftware = [
  {
    slug: "pocketmine-mp",
    name: "PocketMine-MP",
    description:
      "A highly customizable server software for Minecraft: Bedrock Edition written in PHP.",
    adapterId: "pmmp",
    websiteUrl: "https://pmmp.io/",
    repositoryUrl: "https://github.com/pmmp/PocketMine-MP",
    enabled: true,
    sortOrder: 10,
  },
  {
    slug: "powernukkitx",
    name: "PowerNukkitX",
    description: "A Java server software for Minecraft: Bedrock Edition with broad plugin support.",
    adapterId: "powernukkitx",
    websiteUrl: "https://powernukkitx.org/",
    repositoryUrl: "https://github.com/PowerNukkitX/PowerNukkitX",
    enabled: true,
    sortOrder: 20,
  },
] as const;

async function seedDefaultSoftware(ctx: MutationCtx) {
  const records = [];

  for (const software of defaultSoftware) {
    assertNormalizedSlug(software.slug);

    const existing = await ctx.db
      .query("serverSoftware")
      .withIndex("by_slug", (query) => query.eq("slug", software.slug))
      .unique();

    if (existing) {
      const isCurrent =
        existing.name === software.name &&
        existing.description === software.description &&
        existing.adapterId === software.adapterId &&
        existing.websiteUrl === software.websiteUrl &&
        existing.repositoryUrl === software.repositoryUrl &&
        existing.enabled === software.enabled &&
        existing.sortOrder === software.sortOrder;

      if (isCurrent) {
        records.push(existing);
        continue;
      }

      const updatedAt = Date.now();
      await ctx.db.patch("serverSoftware", existing._id, {
        ...software,
        updatedAt,
      });
      records.push({ ...existing, ...software, updatedAt });
      continue;
    }

    const now = Date.now();
    const id = await ctx.db.insert("serverSoftware", {
      ...software,
      createdAt: now,
      updatedAt: now,
    });
    const inserted = await ctx.db.get("serverSoftware", id);

    if (inserted) {
      records.push(inserted);
    }
  }

  return records;
}

export const seedDefaults = internalMutation({
  args: {},
  returns: v.array(serverSoftwareValidator),
  handler: async (ctx) => await seedDefaultSoftware(ctx),
});

export const seedDefaultsAsAdmin = adminMutation({
  args: {},
  returns: v.array(serverSoftwareValidator),
  handler: async (ctx) => await seedDefaultSoftware(ctx),
});
