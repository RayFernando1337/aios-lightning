import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireHost, requireIdentity } from "./lib/auth";
import { requireEvent, resolveEvent } from "./lib/eventLookup";
import { FIELD_LIMITS } from "./lib/limits";
import { requireText } from "./lib/text";
import { statusValidator, submissionFields } from "./schema";

const submissionDoc = v.object({
  _id: v.id("submissions"),
  _creationTime: v.number(),
  ...submissionFields,
});

const boardEntry = v.object({
  _id: v.id("submissions"),
  displayName: v.string(),
  demoTitle: v.string(),
  whatYoullShowLive: v.string(),
  takeaway: v.string(),
});

/** The signed-in applicant's submission for one event, or null. */
export const mine = query({
  args: { slug: v.optional(v.string()) },
  returns: v.union(submissionDoc, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    const event = await resolveEvent(ctx, args.slug);
    if (event === null) {
      return null;
    }

    return await ctx.db
      .query("submissions")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", event._id).eq("userId", identity.subject),
      )
      .unique();
  },
});

/**
 * Create the applicant's submission for this event, or edit it in place.
 * One row per user per event.
 */
export const submit = mutation({
  args: {
    slug: v.optional(v.string()),
    displayName: v.string(),
    demoTitle: v.string(),
    whatYoullShowLive: v.string(),
    takeaway: v.string(),
    noSlides: v.boolean(),
    noPitch: v.boolean(),
    readyIn60s: v.boolean(),
  },
  returns: v.id("submissions"),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const event = await resolveEvent(ctx, args.slug);
    if (event === null) {
      throw new ConvexError("Event not found.");
    }

    if (!args.noSlides || !args.noPitch || !args.readyIn60s) {
      throw new ConvexError("Check all three boxes to apply.");
    }

    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", event._id).eq("userId", identity.subject),
      )
      .unique();

    if (existing === null && event.phase === "closed") {
      throw new ConvexError("Applications are closed for this event.");
    }

    const content = {
      displayName: requireText(
        args.displayName,
        "Your name",
        FIELD_LIMITS.displayName,
      ),
      demoTitle: requireText(
        args.demoTitle,
        "Demo title",
        FIELD_LIMITS.demoTitle,
      ),
      whatYoullShowLive: requireText(
        args.whatYoullShowLive,
        "What you will show live",
        FIELD_LIMITS.whatYoullShowLive,
      ),
      takeaway: requireText(args.takeaway, "Takeaway", FIELD_LIMITS.takeaway),
      noSlides: args.noSlides,
      noPitch: args.noPitch,
      readyIn60s: args.readyIn60s,
      updatedAt: Date.now(),
    };

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        ...content,
        email: identity.email ?? existing.email,
      });
      return existing._id;
    }

    return await ctx.db.insert("submissions", {
      ...content,
      eventId: event._id,
      userId: identity.subject,
      email: identity.email ?? "",
      status: "submitted",
      createdAt: Date.now(),
    });
  },
});

/** Every submission for one event, newest first. Hosts only. */
export const listForHost = query({
  args: { eventId: v.id("events") },
  returns: v.array(submissionDoc),
  handler: async (ctx, args) => {
    await requireHost(ctx);
    await requireEvent(ctx, args.eventId);

    const rows = await ctx.db
      .query("submissions")
      .withIndex("by_event_status", (q) => q.eq("eventId", args.eventId))
      .collect();

    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Move a submission through submitted, shortlisted, selected, rejected. Hosts only. */
export const setStatus = mutation({
  args: {
    submissionId: v.id("submissions"),
    status: statusValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireHost(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (submission === null) {
      throw new ConvexError("Submission not found.");
    }

    const event = await requireEvent(ctx, submission.eventId);
    const isNewlySelected =
      args.status === "selected" && submission.status !== "selected";

    if (isNewlySelected) {
      const selected = await ctx.db
        .query("submissions")
        .withIndex("by_event_status", (q) =>
          q.eq("eventId", event._id).eq("status", "selected"),
        )
        .collect();

      if (selected.length >= event.capacity) {
        throw new ConvexError(
          `All ${event.capacity} slots are taken. Move someone out of selected first.`,
        );
      }
    }

    await ctx.db.patch(args.submissionId, {
      status: args.status,
      updatedAt: Date.now(),
      selectedAt: isNewlySelected
        ? Date.now()
        : args.status === "selected"
          ? submission.selectedAt
          : undefined,
    });

    return null;
  },
});

/** Public running order for one event. */
export const board = query({
  args: { slug: v.optional(v.string()) },
  returns: v.array(boardEntry),
  handler: async (ctx, args) => {
    const event = await resolveEvent(ctx, args.slug);
    if (event === null) {
      return [];
    }

    const selected = await ctx.db
      .query("submissions")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", event._id).eq("status", "selected"),
      )
      .collect();

    return selected
      .sort(
        (a, b) => (a.selectedAt ?? a.updatedAt) - (b.selectedAt ?? b.updatedAt),
      )
      .map((submission) => ({
        _id: submission._id,
        displayName: submission.displayName,
        demoTitle: submission.demoTitle,
        whatYoullShowLive: submission.whatYoullShowLive,
        takeaway: submission.takeaway,
      }));
  },
});
