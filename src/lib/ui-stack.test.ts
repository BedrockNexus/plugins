import { describe, expect, it } from "vitest";

import componentsConfig from "../../components.json";
import packageJson from "../../package.json";

describe("UI stack", () => {
  it("keeps shadcn configured for Base UI without Radix UI", () => {
    expect(componentsConfig.style).toMatch(/^base-/);
    expect(packageJson.dependencies).toHaveProperty("@base-ui/react");
    expect(packageJson.dependencies).not.toHaveProperty("radix-ui");
  });
});
