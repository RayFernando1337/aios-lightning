import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

const BACKFILL_BATCH = 32;

const STATUS_RANK = {
  rejected: 0,
  submitted: 1,
  shortlisted: 2,
  selected: 3,
} as const;

function preferOrphan(
  orphan: Doc<"submissions">,
  existing: Doc<"submissions">,
): boolean {
  const orphanRank = STATUS_RANK[orphan.status];
  const existingRank = STATUS_RANK[existing.status];
  if (orphanRank !== existingRank) {
    return orphanRank > existingRank;
  }
  return orphan.updatedAt > existing.updatedAt;
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
    await ctx.db.patch("submissions", orphan._id, { eventId });
    return;
  }

  if (existing._id === orphan._id) {
    return;
  }

  if (preferOrphan(orphan, existing)) {
    await ctx.db.patch("submissions", existing._id, {
      displayName: orphan.displayName,
      demoTitle: orphan.demoTitle,
      whatYoullShowLive: orphan.whatYoullShowLive,
      takeaway: orphan.takeaway,
      noSlides: orphan.noSlides,
      noPitch: orphan.noPitch,
      readyIn60s: orphan.readyIn60s,
      status: orphan.status,
      email: orphan.email,
      selectedAt: orphan.selectedAt,
      updatedAt: orphan.updatedAt,
    });
  }

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
