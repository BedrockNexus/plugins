import { describe, expect, it } from "vitest";

import { publicNavigation, siteConfig, softwareCatalog } from "./site";

describe("site foundation", () => {
  it("keeps public navigation and canonical URLs local to the standalone product", () => {
    expect(siteConfig.url).toBe("https://plugins.bedrocknexus.com");
    expect(publicNavigation.every((item) => item.href.startsWith("/"))).toBe(true);
  });

  it("exposes only the two approved MVP software adapters", () => {
    expect(softwareCatalog.map((software) => software.slug)).toEqual([
      "pocketmine-mp",
      "powernukkitx",
    ]);
  });
});
