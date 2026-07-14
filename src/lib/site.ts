import { Boxes, Compass, LayoutDashboard, ShieldCheck } from "lucide-react";

export const siteConfig = {
  name: "BedrockNexus Plugins",
  shortName: "Plugins",
  description:
    "A GitHub-powered publishing and discovery platform for Minecraft Bedrock server extensions.",
  url: "https://plugins.bedrocknexus.com",
  githubUrl: "https://github.com/BedrockNexus/plugins",
} as const;

export const publicNavigation = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/software", label: "Software", icon: Boxes },
] as const;

export const workspaceNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
] as const;

export const softwareCatalog = [
  {
    name: "PocketMine-MP",
    slug: "pocketmine-mp",
    language: "PHP",
    format: ".phar",
    tone: "emerald",
    status: "MVP adapter",
  },
  {
    name: "PowerNukkitX",
    slug: "powernukkitx",
    language: "Java / Kotlin",
    format: ".jar",
    tone: "sky",
    status: "MVP adapter",
  },
] as const;
