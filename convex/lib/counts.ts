import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

export async function countSelected(
  ctx: QueryCtx | MutationCtx,
  eventId: Id<"events">,
): Promise<number> {
  const selected = await ctx.db
    .query("submissions")
    .withIndex("by_event_status", (q) =>
      q.eq("eventId", eventId).eq("status", "selected"),
    )
    .collect();
  return selected.length;
}
