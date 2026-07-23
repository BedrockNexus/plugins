/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function insertUser(
  t: ReturnType<typeof convexTest>,
  tokenIdentifier: string,
  role: Doc<"users">["role"],
) {
  return await t.run(async (ctx) => {
    const now = Date.now();

    return await ctx.db.insert("users", {
      authUserId: `auth-${role}`,
      authTokenIdentifier: tokenIdentifier,
      name: `${role} user`,
      email: `${role}@example.com`,
      role,
      createdAt: now,
      updatedAt: now,
    });
  });
}

describe("backend role authorization", () => {
  it("rejects unauthenticated access to admin functions", async () => {
    const t = convexTest(schema, modules);

    await expect(t.query(api.admin.getAccess, {})).rejects.toThrow("Sign in is required");
  });

  it("rejects developer access to moderator and admin functions", async () => {
    const t = convexTest(schema, modules);
    const tokenIdentifier = "https://convex.test|developer";
    await insertUser(t, tokenIdentifier, "developer");
    const developer = t.withIdentity({ tokenIdentifier });

    await expect(developer.query(api.moderation.getAccess, {})).rejects.toThrow(
      "moderator access is required",
    );
    await expect(developer.query(api.admin.getAccess, {})).rejects.toThrow(
      "admin access is required",
    );
  });

  it("allows moderators to moderate but not administer", async () => {
    const t = convexTest(schema, modules);
    const tokenIdentifier = "https://convex.test|moderator";
    await insertUser(t, tokenIdentifier, "moderator");
    const moderator = t.withIdentity({ tokenIdentifier });

    await expect(moderator.query(api.moderation.getAccess, {})).resolves.toEqual({
      authorized: true,
      role: "moderator",
    });
    await expect(moderator.query(api.admin.getAccess, {})).rejects.toThrow(
      "admin access is required",
    );
  });

  it("allows admins through both protected function boundaries", async () => {
    const t = convexTest(schema, modules);
    const tokenIdentifier = "https://convex.test|admin";
    await insertUser(t, tokenIdentifier, "admin");
    const admin = t.withIdentity({ tokenIdentifier });

    await expect(admin.query(api.moderation.getAccess, {})).resolves.toEqual({
      authorized: true,
      role: "admin",
    });
    await expect(admin.query(api.admin.getAccess, {})).resolves.toEqual({
      authorized: true,
      role: "admin",
    });
  });
});
