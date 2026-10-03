import { expect, test } from "@playwright/test";

/**
 * Signed-in flows need a real GitHub sign-in, which cannot be automated.
 * Record a session once per environment and point these variables at it:
 *
 *   bunx playwright codegen --save-storage=e2e/.auth/developer.json <base-url>/login
 *
 * E2E_DEVELOPER_STORAGE: any signed-in account.
 * E2E_MODERATOR_STORAGE: an account with the moderator or admin role.
 */
const developerStorage = process.env.E2E_DEVELOPER_STORAGE;
const moderatorStorage = process.env.E2E_MODERATOR_STORAGE;

test.describe("developer workspace", () => {
  test.skip(!developerStorage, "Set E2E_DEVELOPER_STORAGE to run signed-in tests");
  test.use({ storageState: developerStorage });

  test("dashboard and project workspace load", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto("/dashboard/projects");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("publishing starts from repository connection", async ({ page }) => {
    await page.goto("/dashboard/projects/new");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("non-moderators cannot open administration", async ({ page }) => {
    await page.goto("/admin/reviews");
    await expect(page).toHaveURL(/\/dashboard\?access=denied$/);
  });
});

test.describe("moderation", () => {
  test.skip(!moderatorStorage, "Set E2E_MODERATOR_STORAGE to run moderator tests");
  test.use({ storageState: moderatorStorage });

  test("review queue and deliveries load", async ({ page }) => {
    await page.goto("/admin/reviews");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/admin/deliveries");
    await expect(page.getByRole("heading", { level: 1, name: "Webhook deliveries" })).toBeVisible();
  });
});
