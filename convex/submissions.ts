import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireHost, requireIdentity } from "./lib/auth";
import { FIELD_LIMITS, MAX_SELECTED } from "./lib/limits";
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
});

/** The signed in applicant's own submission, or null before they apply. */
export const mySubmission = query({
  args: {},
  returns: v.union(submissionDoc, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    return await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();
  },
});

/**
 * Create the applicant's submission, or edit it in place if they already have one.
 * One row per user, always.
 */
export const submit = mutation({
  args: {
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

    if (!args.noSlides || !args.noPitch || !args.readyIn60s) {
      throw new ConvexError("Check all three boxes to apply.");
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

    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        ...content,
        email: identity.email ?? existing.email,
      });
      return existing._id;
    }

    return await ctx.db.insert("submissions", {
      ...content,
      userId: identity.subject,
      email: identity.email ?? "",
      status: "submitted",
      createdAt: Date.now(),
    });
  },
});

/** Every submission, newest first. Hosts only. */
export const listForHost = query({
  args: {},
  returns: v.array(submissionDoc),
  handler: async (ctx) => {
    await requireHost(ctx);
    return await ctx.db.query("submissions").order("desc").collect();
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

    const isNewlySelected =
      args.status === "selected" && submission.status !== "selected";

    if (isNewlySelected) {
      const selected = await ctx.db
        .query("submissions")
        .withIndex("by_status", (q) => q.eq("status", "selected"))
        .collect();

      if (selected.length >= MAX_SELECTED) {
        throw new ConvexError(
          `All ${MAX_SELECTED} slots are taken. Move someone out of selected first.`,
        );
      }
    }

    await ctx.db.patch(args.submissionId, {
      status: args.status,
      updatedAt: Date.now(),
      // Board order follows selection time, not edit time, so applicants can
      // fix typos without shuffling the lineup.
      selectedAt: isNewlySelected
        ? Date.now()
        : args.status === "selected"
          ? submission.selectedAt
          : undefined,
    });

    return null;
  },
});

/** Public running order for the room: selected names and titles only. */
export const board = query({
  args: {},
  returns: v.array(boardEntry),
  handler: async (ctx) => {
    const selected = await ctx.db
      .query("submissions")
      .withIndex("by_status", (q) => q.eq("status", "selected"))
      .collect();

    // Rows selected before `selectedAt` existed fall back to `updatedAt`,
    // preserving the ordering they had under the old sort.
    return selected
      .sort(
        (a, b) => (a.selectedAt ?? a.updatedAt) - (b.selectedAt ?? b.updatedAt),
      )
      .map((submission) => ({
        _id: submission._id,
        displayName: submission.displayName,
        demoTitle: submission.demoTitle,
      }));
  },
});
