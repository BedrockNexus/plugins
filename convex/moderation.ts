import { v } from "convex/values";

import { query } from "./_generated/server";
import { requireModerator } from "./lib/authorization";
import { roleValidator } from "./schema";

export const getAccess = query({
  args: {},
  returns: v.object({
    authorized: v.literal(true),
    role: roleValidator,
  }),
  handler: async (ctx) => {
    const user = await requireModerator(ctx);

    return {
      authorized: true as const,
      role: user.role,
    };
  },
});
