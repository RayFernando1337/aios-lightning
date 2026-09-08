import { v } from "convex/values";
import { query } from "./_generated/server";
import { identityIsHost } from "./lib/auth";

/**
 * Viewer-scoped and deliberately public: it reveals only whether the caller's
 * own session is on the host allowlist, never who the hosts are.
 */
export const amHost = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) return false;
    return identityIsHost(identity);
  },
});
