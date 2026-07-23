import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const roleValidator = v.union(
  v.literal("developer"),
  v.literal("verifiedCreator"),
  v.literal("moderator"),
  v.literal("admin"),
);

export const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  authUserId: v.string(),
  authTokenIdentifier: v.string(),
  name: v.string(),
  email: v.string(),
  image: v.optional(v.string()),
  role: roleValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const creatorProfileValidator = v.object({
  _id: v.id("creatorProfiles"),
  _creationTime: v.number(),
  userId: v.id("users"),
  displayName: v.string(),
  avatarUrl: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export default defineSchema({
  users: defineTable({
    authUserId: v.string(),
    authTokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: roleValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_user_id", ["authUserId"])
    .index("by_auth_token_identifier", ["authTokenIdentifier"])
    .index("by_email", ["email"]),
  creatorProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),
});
