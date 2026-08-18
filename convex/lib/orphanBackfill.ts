import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { mergeOrphanFields } from "./orphanMerge";

const BACKFILL_BATCH = 32;

async function hasOpenSelectedSlot(
  ctx: MutationCtx,
  eventId: Id<"events">,
): Promise<boolean> {
  const event = await ctx.db.get("events", eventId);
  if (event === null) {
    return false;
  }

  const selected = await ctx.db
    .query("submissions")
    .withIndex("by_event_status", (q) =>
      q.eq("eventId", eventId).eq("status", "selected"),
    )
    .take(event.capacity);

  return selected.length < event.capacity;
}

export async function isSubmissionBackfillDone(
  ctx: MutationCtx,
): Promise<boolean> {
  const settings = await ctx.db.query("settings").first();
  return settings?.submissionEventBackfillDone === true;
}

export async function attachOrphanToEvent(
  ctx: MutationCtx,
  orphan: Doc<"submissions">,
  eventId: Id<"events">,
): Promise<void> {
  const existing = await ctx.db
    .query("submissions")
    .withIndex("by_event_user", (q) =>
      q.eq("eventId", eventId).eq("userId", orphan.userId),
    )
    .unique();

  if (existing === null) {
    if (
      orphan.status === "selected" &&
      !(await hasOpenSelectedSlot(ctx, eventId))
    ) {
      await ctx.db.patch("submissions", orphan._id, {
        eventId,
        status: "shortlisted",
        selectedAt: undefined,
      });
      return;
    }

    await ctx.db.patch("submissions", orphan._id, { eventId });
    return;
  }

  if (existing._id === orphan._id) {
    return;
  }

  const merged = mergeOrphanFields(
    orphan,
    existing,
    await hasOpenSelectedSlot(ctx, eventId),
  );
  await ctx.db.patch("submissions", existing._id, merged);
  await ctx.db.delete("submissions", orphan._id);
}

export async function backfillOrphanPage(
  ctx: MutationCtx,
  eventId: Id<"events">,
  cursor: string | null,
): Promise<{ done: boolean; continueCursor: string | null }> {
  if (await isSubmissionBackfillDone(ctx)) {
    return { done: true, continueCursor: null };
  }

  const page = await ctx.db.query("submissions").paginate({
    numItems: BACKFILL_BATCH,
    cursor,
  });

  for (const submission of page.page) {
    if (submission.eventId === undefined) {
      await attachOrphanToEvent(ctx, submission, eventId);
    }
  }

  if (page.isDone) {
    const settings = await ctx.db.query("settings").first();
    if (settings !== null) {
      await ctx.db.patch("settings", settings._id, {
        submissionEventBackfillDone: true,
      });
    }
    return { done: true, continueCursor: null };
  }

  return { done: false, continueCursor: page.continueCursor };
}
