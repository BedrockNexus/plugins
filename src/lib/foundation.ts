export const product = {
  name: "BedrockNexus Plugins",
  domain: "plugins.bedrocknexus.com",
  tagline: "Plugins for every Minecraft Bedrock server software.",
} as const;

export function hasStandaloneRuntimeBoundary(domain: string) {
  return domain !== "bedrocknexus.com";
}
