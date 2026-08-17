import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const statusValidator = v.union(
  v.literal("submitted"),
  v.literal("shortlisted"),
  v.literal("selected"),
  v.literal("rejected"),
);

export const phaseValidator = v.union(v.literal("open"), v.literal("closed"));

export const ruleValidator = v.object({
  title: v.string(),
  body: v.string(),
});

export const eventFields = {
  name: v.string(),
  slug: v.string(),
  when: v.string(),
  where: v.string(),
  room: v.string(),
  capacity: v.number(),
  dryRun: v.string(),
  heroImage: v.string(),
  phase: phaseValidator,
  rules: v.array(ruleValidator),
  flow: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const submissionFields = {
  eventId: v.optional(v.id("events")),
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
  events: defineTable(eventFields)
    .index("by_slug", ["slug"])
    .index("by_phase", ["phase"]),

  settings: defineTable({
    featuredEventId: v.id("events"),
  }),

  submissions: defineTable(submissionFields)
    .index("by_event_user", ["eventId", "userId"])
    .index("by_event_status", ["eventId", "status"]),
});
