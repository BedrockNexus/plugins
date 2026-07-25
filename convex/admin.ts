import { v } from "convex/values";

import { adminQuery } from "./lib/authorization";
import { roleValidator } from "./schema";

export const getAccess = adminQuery({
  args: {},
  returns: v.object({
    authorized: v.literal(true),
    role: roleValidator,
  }),
  handler: async (ctx) => {
    return {
      authorized: true as const,
      role: ctx.user.role,
    };
  },
});
