import { createAuth } from "../auth";

// Static instance used by the Better Auth CLI when generating the component schema.
export const auth = createAuth({} as never);
