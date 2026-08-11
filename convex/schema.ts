import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const statusValidator = v.union(
  v.literal("submitted"),
  v.literal("shortlisted"),
  v.literal("selected"),
  v.literal("rejected"),
);

export const submissionFields = {
  // Clerk user id (the `sub` claim on the Convex JWT).
  userId: v.string(),
  email: v.string(),
  displayName: v.string(),
  demoTitle: v.string(),
  whatYoullShowLive: v.string(),
  takeaway: v.string(),
  noSlides: v.boolean(),
  noPitch: v.boolean(),
  readyIn60s: v.boolean(),
  status: statusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
  // When a host moved this row into `selected`. Drives the board order and is
  // cleared when the row leaves `selected`.
  selectedAt: v.optional(v.number()),
};

export default defineSchema({
  submissions: defineTable(submissionFields)
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
});
