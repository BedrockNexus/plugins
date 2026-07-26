import { ConvexError, v } from "convex/values";

import {
  getDefaultWorkflowTemplate,
  getWorkflowTemplateDescriptor,
  validateWorkflowTemplate,
  WORKFLOW_TEMPLATE_DESCRIPTORS,
  type WorkflowTemplateKey,
} from "../../../src/lib/adapters/workflow-templates";
import { internalQuery } from "../../_generated/server";
import { adminMutation, adminQuery } from "../../lib/authorization";
import { workflowTemplateKeyValidator } from "../../schema";

const workflowTemplateResultValidator = v.object({
  key: workflowTemplateKeyValidator,
  adapterId: v.union(v.literal("pocketmine-mp"), v.literal("powernukkitx")),
  buildSystem: v.union(v.literal("composer"), v.literal("gradle"), v.literal("maven")),
  label: v.string(),
  content: v.string(),
  source: v.union(v.literal("default"), v.literal("override")),
  version: v.number(),
  updatedAt: v.optional(v.number()),
});

function validatedContent(content: string) {
  try {
    return validateWorkflowTemplate(content);
  } catch (error) {
    throw new ConvexError({
      code: "INVALID_WORKFLOW_TEMPLATE",
      message: error instanceof Error ? error.message : "The workflow template is invalid.",
    });
  }
}

export const list = adminQuery({
  args: {},
  returns: v.array(workflowTemplateResultValidator),
  handler: async (ctx) => {
    return await Promise.all(
      WORKFLOW_TEMPLATE_DESCRIPTORS.map(async (descriptor) => {
        const override = await ctx.db
          .query("workflowTemplates")
          .withIndex("by_key", (query) => query.eq("key", descriptor.key))
          .unique();
        return {
          key: descriptor.key,
          adapterId: descriptor.adapterId,
          buildSystem: descriptor.buildSystem,
          label: descriptor.label,
          content: override?.content ?? getDefaultWorkflowTemplate(descriptor.key),
          source: override ? ("override" as const) : ("default" as const),
          version: override?.version ?? 1,
          updatedAt: override?.updatedAt,
        };
      }),
    );
  },
});

export const save = adminMutation({
  args: {
    key: workflowTemplateKeyValidator,
    content: v.string(),
  },
  returns: v.object({
    key: workflowTemplateKeyValidator,
    version: v.number(),
  }),
  handler: async (ctx, args) => {
    const descriptor = getWorkflowTemplateDescriptor(args.key as WorkflowTemplateKey);
    const content = validatedContent(args.content);
    const existing = await ctx.db
      .query("workflowTemplates")
      .withIndex("by_key", (query) => query.eq("key", args.key))
      .unique();
    const now = Date.now();
    const version = existing ? existing.version + 1 : 1;
    if (existing) {
      await ctx.db.patch("workflowTemplates", existing._id, {
        content,
        version,
        updatedBy: ctx.user._id,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("workflowTemplates", {
        key: descriptor.key,
        adapterId: descriptor.adapterId,
        buildSystem: descriptor.buildSystem,
        content,
        version,
        updatedBy: ctx.user._id,
        createdAt: now,
        updatedAt: now,
      });
    }
    await ctx.db.insert("adminActions", {
      actorUserId: ctx.user._id,
      action: "workflowTemplate.save",
      targetType: "workflowTemplate",
      targetKey: args.key,
      reason: `Saved ${descriptor.label} workflow template version ${version}.`,
      previousState: existing ? `version:${existing.version}` : "default",
      resultingState: `version:${version}`,
      createdAt: now,
    });
    return { key: descriptor.key, version };
  },
});

export const reset = adminMutation({
  args: { key: workflowTemplateKeyValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    const descriptor = getWorkflowTemplateDescriptor(args.key as WorkflowTemplateKey);
    const existing = await ctx.db
      .query("workflowTemplates")
      .withIndex("by_key", (query) => query.eq("key", args.key))
      .unique();
    if (!existing) {
      return null;
    }
    await ctx.db.delete("workflowTemplates", existing._id);
    await ctx.db.insert("adminActions", {
      actorUserId: ctx.user._id,
      action: "workflowTemplate.reset",
      targetType: "workflowTemplate",
      targetKey: args.key,
      reason: `Reset ${descriptor.label} to its code-defined default.`,
      previousState: `version:${existing.version}`,
      resultingState: "default",
      createdAt: Date.now(),
    });
    return null;
  },
});

export const getOverride = internalQuery({
  args: { key: workflowTemplateKeyValidator },
  returns: v.union(
    v.object({
      content: v.string(),
      version: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const override = await ctx.db
      .query("workflowTemplates")
      .withIndex("by_key", (query) => query.eq("key", args.key))
      .unique();
    return override ? { content: override.content, version: override.version } : null;
  },
});
