import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { CAPACITY_MAX } from "./limits";

export async function countSelected(
  ctx: QueryCtx | MutationCtx,
  eventId: Id<"events">,
  limit: number = CAPACITY_MAX,
): Promise<number> {
  const selected = await ctx.db
    .query("submissions")
    .withIndex("by_event_status", (q) =>
      q.eq("eventId", eventId).eq("status", "selected"),
    )
    .take(Math.max(1, limit));
  return selected.length;
}

export async function countByStatus(
  ctx: QueryCtx | MutationCtx,
  eventId: Id<"events">,
  status: "submitted" | "shortlisted" | "selected" | "rejected",
  limit: number,
): Promise<number> {
  const rows = await ctx.db
    .query("submissions")
    .withIndex("by_event_status", (q) =>
      q.eq("eventId", eventId).eq("status", status),
    )
    .take(Math.max(1, limit));
  return rows.length;
}
