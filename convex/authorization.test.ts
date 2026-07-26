/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, components } from "./_generated/api";
import betterAuthSchema from "./betterAuth/schema";
import type { AppRole } from "./lib/authorization";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const betterAuthModules = import.meta.glob("./betterAuth/**/*.ts");

function createTest() {
  const t = convexTest(schema, modules);
  t.registerComponent("betterAuth", betterAuthSchema, betterAuthModules);
  return t;
}

async function insertUser(t: ReturnType<typeof convexTest>, label: string, role: AppRole) {
  const now = Date.now();
  const user = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: "user",
      data: {
        emailVerified: true,
        name: `${role} user`,
        email: `${label}@example.com`,
        role,
        createdAt: now,
        updatedAt: now,
      },
    },
  });
  const subject = user._id as string;
  const session = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: "session",
      data: {
        token: `session-${label}`,
        userId: subject,
        expiresAt: now + 60_000,
        createdAt: now,
        updatedAt: now,
      },
    },
  });
  return { subject, sessionId: session._id as string };
}

describe("backend role authorization", () => {
  it("rejects unauthenticated access to admin functions", async () => {
    const t = createTest();

    await expect(t.query(api.functions.site.admin.getAccess, {})).rejects.toThrow(
      "Sign in is required",
    );
  });

  it("rejects developer access to moderator and admin functions", async () => {
    const t = createTest();
    const { subject, sessionId } = await insertUser(t, "developer", "developer");
    const tokenIdentifier = `https://convex.test|${subject}`;
    const developer = t.withIdentity({ subject, sessionId, tokenIdentifier });

    await expect(developer.query(api.functions.site.moderation.getAccess, {})).rejects.toThrow(
      "moderator access is required",
    );
    await expect(developer.query(api.functions.site.admin.getAccess, {})).rejects.toThrow(
      "admin access is required",
    );
  });

  it("allows moderators to moderate but not administer", async () => {
    const t = createTest();
    const { subject, sessionId } = await insertUser(t, "moderator", "moderator");
    const tokenIdentifier = `https://convex.test|${subject}`;
    const moderator = t.withIdentity({ subject, sessionId, tokenIdentifier });

    await expect(moderator.query(api.functions.site.moderation.getAccess, {})).resolves.toEqual({
      authorized: true,
      role: "moderator",
    });
    await expect(moderator.query(api.functions.site.admin.getAccess, {})).rejects.toThrow(
      "admin access is required",
    );
  });

  it("allows admins through both protected function boundaries", async () => {
    const t = createTest();
    const { subject, sessionId } = await insertUser(t, "admin", "admin");
    const tokenIdentifier = `https://convex.test|${subject}`;
    const admin = t.withIdentity({ subject, sessionId, tokenIdentifier });

    await expect(admin.query(api.functions.site.moderation.getAccess, {})).resolves.toEqual({
      authorized: true,
      role: "admin",
    });
    await expect(admin.query(api.functions.site.admin.getAccess, {})).resolves.toEqual({
      authorized: true,
      role: "admin",
    });
  });
});
