import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { identityIsHost, requireHost, requireIdentity } from "./lib/auth";
import { countSelected } from "./lib/counts";
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

const mineAllEntry = v.object({
  _id: v.id("submissions"),
  eventId: v.id("events"),
  eventName: v.string(),
  eventSlug: v.string(),
  eventWhen: v.string(),
  eventRoom: v.string(),
  status: statusValidator,
  title: v.string(),
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

    return (
      (await ctx.db
        .query("submissions")
        .withIndex("by_event_user", (q) =>
          q.eq("eventId", event._id).eq("userId", identity.subject),
        )
        .first()) ?? null
    );
  },
});

/** Every signup belonging to the signed-in applicant, across nights. */
export const mineAll = query({
  args: {},
  returns: v.array(mineAllEntry),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return [];
    }

    const rows = await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const result = [];
    for (const row of rows) {
      if (row.eventId === undefined) {
        continue;
      }
      const event = await ctx.db.get("events", row.eventId);
      if (event === null) {
        continue;
      }
      result.push({
        _id: row._id,
        eventId: event._id,
        eventName: event.name,
        eventSlug: event.slug,
        eventWhen: event.when,
        eventRoom: event.room,
        status: row.status,
        title: row.demoTitle,
      });
    }

    return result;
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
      .first();

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
      await ctx.db.patch("submissions", existing._id, {
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

/** Move a signup onto another open night. Applicant or host. */
export const move = mutation({
  args: {
    submissionId: v.id("submissions"),
    toEventId: v.id("events"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const submission = await ctx.db.get("submissions", args.submissionId);
    if (submission === null) {
      throw new ConvexError("Signup not found.");
    }

    const identity = await requireIdentity(ctx);
    const host = identityIsHost(identity);
    if (!host && submission.userId !== identity.subject) {
      throw new ConvexError("You can only move your own signup.");
    }

    const target = await ctx.db.get("events", args.toEventId);
    if (target === null) {
      throw new ConvexError("Event not found.");
    }
    if (target.phase !== "open") {
      throw new ConvexError("That night is not open.");
    }

    if (submission.eventId === args.toEventId) {
      return null;
    }

    const collision = await ctx.db
      .query("submissions")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.toEventId).eq("userId", submission.userId),
      )
      .first();
    if (collision !== null && collision._id !== submission._id) {
      throw new ConvexError(
        "Already signed up for that night. Remove or keep the existing one.",
      );
    }

    if (submission.status === "selected") {
      const selected = await countSelected(ctx, args.toEventId);
      if (selected >= target.capacity) {
        await ctx.db.patch("submissions", submission._id, {
          eventId: args.toEventId,
          status: "shortlisted",
          selectedAt: undefined,
          updatedAt: Date.now(),
        });
        return null;
      }
    }

    await ctx.db.patch("submissions", submission._id, {
      eventId: args.toEventId,
      updatedAt: Date.now(),
    });
    return null;
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

    const submission = await ctx.db.get("submissions", args.submissionId);
    if (submission === null) {
      throw new ConvexError("Submission not found.");
    }

    if (submission.eventId === undefined) {
      throw new ConvexError("Submission is missing an event.");
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

    await ctx.db.patch("submissions", args.submissionId, {
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
