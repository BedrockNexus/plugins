import { expect, test } from "@playwright/test";

test.describe("public catalog", () => {
  test("home page searches the catalog", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Bedrock server plugins");
    const hero = page.getByRole("main").getByRole("search");
    await hero.getByLabel("Search plugins").fill("economy");
    await hero.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/\/explore\?q=economy/);
    await expect(page.getByText("Results for", { exact: false }).first()).toBeVisible();
  });

  test("explore filters by server software", async ({ page }) => {
    await page.goto("/explore");
    const filters = page.getByRole("complementary", { name: "Filters" });
    await expect(filters.getByRole("link", { name: /All software/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await filters.getByRole("link", { name: /PocketMine-MP/ }).click();
    await expect(page).toHaveURL(/software=pocketmine-mp/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("PocketMine-MP plugins");
  });

  test("software directory lists supported platforms", async ({ page }) => {
    await page.goto("/software");
    await expect(page.getByRole("link", { name: /PocketMine-MP/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /PowerNukkitX/ })).toBeVisible();
  });

  for (const path of [
    "/projects/does-not-exist",
    "/software/does-not-exist",
    "/creators/does-not-exist",
    "/organizations/does-not-exist",
  ]) {
    test(`${path} returns 404`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(404);
    });
  }

  test("responses carry security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("pages use a fresh script nonce and block inline handlers", async ({ page, request }) => {
    const nonceOf = (policy: string | undefined) => policy?.match(/'nonce-([^']+)'/)?.[1];
    const first = nonceOf((await request.get("/")).headers()["content-security-policy"]);
    const second = nonceOf((await request.get("/")).headers()["content-security-policy"]);
    expect(first).toBeTruthy();
    expect(first).not.toBe(second);

    await page.goto("/");
    const result = await page.evaluate(async () => {
      const scripts = [...document.scripts];
      const element = document.createElement("div");
      element.innerHTML = '<img src="data:x" onerror="window.__injected = true">';
      document.body.append(element);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        allScriptsHaveNonce: scripts.every((script) => script.nonce),
        injectedRan: Boolean((window as { __injected?: boolean }).__injected),
      };
    });
    expect(result).toEqual({ allScriptsHaveNonce: true, injectedRan: false });
  });
});

test.describe("access control", () => {
  for (const [path, destination] of [
    ["/dashboard", "/login?redirectTo=/dashboard"],
    ["/dashboard/projects", "/login?redirectTo=/dashboard"],
    ["/admin", "/login?redirectTo=/admin"],
    ["/admin/reviews", "/login?redirectTo=/admin"],
  ] as const) {
    test(`${path} requires sign-in`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL("**/login**");
      const url = new URL(page.url());
      expect(`${url.pathname}${url.search}`).toBe(destination);
    });
  }

  test("GitHub App installation requires sign-in", async ({ request }) => {
    const response = await request.get("/api/github/install", { maxRedirects: 0 });
    expect(response.status()).toBeGreaterThanOrEqual(300);
    expect(response.status()).toBeLessThan(400);
    expect(response.headers().location).toContain("/login");
  });
});

test.describe("download redirects", () => {
  test("unknown or malformed downloads return 404", async ({ request }) => {
    for (const path of ["/download/does-not-exist/1.0.0", "/download/Not_A_Slug/1.0.0"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      test.skip(response.status() === 503, "DOWNLOAD_REDIRECT_SECRET is not configured");
      expect(response.status()).toBe(404);
      expect(response.headers()["cache-control"]).toContain("no-store");
    }
  });
});
