import {
  CompassIcon,
  DashboardBrowsingIcon,
  Package01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

export const siteConfig = {
  name: "BedrockNexus Plugins",
  shortName: "Plugins",
  description:
    "A GitHub-powered publishing and discovery platform for Minecraft Bedrock server extensions.",
  url: "https://plugins.bedrocknexus.com",
  hubUrl: "https://bedrocknexus.com",
  githubUrl: "https://github.com/BedrockNexus/plugins",
} as const;

export const publicNavigation = [
  { href: "/explore", label: "Explore", icon: CompassIcon },
  { href: "/software", label: "Software", icon: Package01Icon },
] as const;

export const workspaceNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardBrowsingIcon },
  { href: "/admin", label: "Admin", icon: Shield01Icon },
] as const;

export const softwareCatalog = [
  {
    name: "PocketMine-MP",
    slug: "pocketmine-mp",
    format: ".phar",
    tone: "emerald",
    status: "MVP adapter",
  },
  {
    name: "PowerNukkitX",
    slug: "powernukkitx",
    format: ".jar",
    tone: "sky",
    status: "MVP adapter",
  },
] as const;
