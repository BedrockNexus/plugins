export const prototypeProject = {
  slug: "nexus-essentials",
  name: "Nexus Essentials",
  summary:
    "A focused collection of moderation and quality-of-life tools for PowerNukkitX communities.",
  creator: "jeantkg",
  software: "PowerNukkitX",
  license: "MIT",
  repository: "BedrockNexus/nexus-essentials",
  version: "1.4.0",
  minecraftVersion: "1.21.90",
  downloads: "12.8K",
  rating: "4.8",
} as const;

export const prototypeVersions = [
  {
    version: "1.4.0",
    published: "Jul 18, 2026",
    compatibility: "PowerNukkitX · 1.21.90",
    status: "Verified build",
  },
  {
    version: "1.3.2",
    published: "Jun 29, 2026",
    compatibility: "PowerNukkitX · 1.21.80",
    status: "Verified build",
  },
  {
    version: "1.3.1",
    published: "Jun 14, 2026",
    compatibility: "PowerNukkitX · 1.21.80",
    status: "Archived",
  },
] as const;

export const publishingTimeline = [
  {
    title: "GitHub App installed",
    description: "The installation grants access to one selected public repository.",
    status: "complete",
  },
  {
    title: "Repository detected",
    description: "PowerNukkitX and Gradle were detected with high confidence.",
    status: "complete",
  },
  {
    title: "Metadata reviewed",
    description: "Confirm the project name, summary, license, categories, and compatibility.",
    status: "current",
  },
  {
    title: "Managed publishing workflow",
    description: "Install the validated publishing workflow directly on the default branch.",
    status: "pending",
  },
  {
    title: "First verified release",
    description: "Correlate the workflow run, version tag, commit, release, and primary asset.",
    status: "pending",
  },
] as const;
