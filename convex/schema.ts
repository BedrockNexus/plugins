import { defineSchema } from "convex/server";

import { tables } from "./schemas/domain";

export * from "./schemas/domain";

export default defineSchema({
  ...tables,
});
