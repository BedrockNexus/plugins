import { describe, expect, it } from "vitest";

import { hasStandaloneRuntimeBoundary, product } from "./foundation";

describe("production foundation", () => {
  it("keeps the plugins product on its standalone domain", () => {
    expect(product.domain).toBe("plugins.bedrocknexus.com");
    expect(hasStandaloneRuntimeBoundary(product.domain)).toBe(true);
  });
});
