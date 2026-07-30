/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { getDefaultWorkflowTemplate } from "../src/lib/adapters/workflow-templates";
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

describe("admin-managed workflow templates", () => {
  it("allows only admins to save validated templates and records the audit action", async () => {
    const t = createTest();
    const developer = await insertUser(t, "workflow-developer", "developer");
    const adminUser = await insertUser(t, "workflow-admin", "admin");
    const developerSubject = developer.subject;
    const adminSubject = adminUser.subject;
    const developerToken = `https://convex.test|${developerSubject}`;
    const adminToken = `https://convex.test|${adminSubject}`;
    const developerClient = t.withIdentity({
      subject: developerSubject,
      sessionId: developer.sessionId,
      tokenIdentifier: developerToken,
    });
    const admin = t.withIdentity({
      subject: adminSubject,
      sessionId: adminUser.sessionId,
      tokenIdentifier: adminToken,
    });
    const content = `${getDefaultWorkflowTemplate("pocketmine-mp:composer")}\n# Admin revision\n`;

    await expect(
      developerClient.mutation(api.functions.admin.workflows.save, {
        key: "pocketmine-mp:composer",
        content,
      }),
    ).rejects.toThrow("admin access is required");

    await expect(
      admin.mutation(api.functions.admin.workflows.save, {
        key: "pocketmine-mp:composer",
        content,
      }),
    ).resolves.toEqual({ key: "pocketmine-mp:composer", version: 1 });

    const templates = await admin.query(api.functions.admin.workflows.list, {});
    expect(templates.find((template) => template.key === "pocketmine-mp:composer")).toMatchObject({
      content,
      source: "override",
      version: 1,
    });
    const auditActions = await t.run((ctx) =>
      ctx.db
        .query("adminActions")
        .withIndex("by_target_key_and_created_at", (query) =>
          query.eq("targetKey", "pocketmine-mp:composer"),
        )
        .take(10),
    );
    expect(auditActions).toHaveLength(1);
    expect(auditActions[0]).toMatchObject({
      action: "workflowTemplate.save",
      previousState: "default",
      resultingState: "version:1",
    });
  });

  it("rejects invalid workflow content before persistence", async () => {
    const t = createTest();
    const adminUser = await insertUser(t, "invalid-workflow-admin", "admin");
    const adminSubject = adminUser.subject;
    const adminToken = `https://convex.test|${adminSubject}`;
    const admin = t.withIdentity({
      subject: adminSubject,
      sessionId: adminUser.sessionId,
      tokenIdentifier: adminToken,
    });

    await expect(
      admin.mutation(api.functions.admin.workflows.save, {
        key: "powernukkitx:gradle",
        content: "name: unsafe",
      }),
    ).rejects.toThrow("must include {{package_name}}");
  });

  it("lets admins add and remove custom publisher-selectable workflows", async () => {
    const t = createTest();
    const adminUser = await insertUser(t, "custom-workflow-admin", "admin");
    const adminSubject = adminUser.subject;
    const admin = t.withIdentity({
      subject: adminSubject,
      sessionId: adminUser.sessionId,
      tokenIdentifier: `https://convex.test|${adminSubject}`,
    });
    const content = `${getDefaultWorkflowTemplate("powernukkitx:gradle")}\n# Runs tests first\n`;

    const created = await admin.mutation(api.functions.admin.workflows.create, {
      label: "PowerNukkitX Gradle with tests",
      adapterId: "powernukkitx",
      buildSystem: "gradle",
      content,
    });
    expect(created).toEqual({
      key: "custom:powernukkitx:gradle:powernukkitx-gradle-with-tests",
      version: 1,
    });

    const templates = await admin.query(api.functions.admin.workflows.list, {});
    expect(templates.find((template) => template.key === created.key)).toMatchObject({
      label: "PowerNukkitX Gradle with tests",
      adapterId: "powernukkitx",
      buildSystem: "gradle",
      source: "custom",
      content,
    });

    await admin.mutation(api.functions.admin.workflows.remove, { key: created.key });
    await expect(admin.query(api.functions.admin.workflows.list, {})).resolves.not.toEqual(
      expect.arrayContaining([expect.objectContaining({ key: created.key })]),
    );
  });
});
