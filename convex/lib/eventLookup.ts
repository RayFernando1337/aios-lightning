import { ConvexError } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function getEventBySlug(
  ctx: Ctx,
  slug: string,
): Promise<Doc<"events"> | null> {
  return await ctx.db
    .query("events")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

export async function getFeaturedEvent(
  ctx: Ctx,
): Promise<Doc<"events"> | null> {
  const settings = await ctx.db.query("settings").first();
  if (settings !== null) {
    const featured = await ctx.db.get(settings.featuredEventId);
    if (featured !== null) {
      return featured;
    }
  }

  const open = await ctx.db
    .query("events")
    .withIndex("by_phase", (q) => q.eq("phase", "open"))
    .order("desc")
    .first();
  if (open !== null) {
    return open;
  }

  return await ctx.db.query("events").order("desc").first();
}

export async function resolveEvent(
  ctx: Ctx,
  slug: string | undefined,
): Promise<Doc<"events"> | null> {
  if (slug !== undefined && slug.length > 0) {
    return await getEventBySlug(ctx, slug);
  }
  return await getFeaturedEvent(ctx);
}

export async function requireEvent(
  ctx: Ctx,
  eventId: Id<"events">,
): Promise<Doc<"events">> {
  const event = await ctx.db.get(eventId);
  if (event === null) {
    throw new ConvexError("Event not found.");
  }
  return event;
}

export async function setFeaturedEvent(
  ctx: MutationCtx,
  eventId: Id<"events">,
): Promise<void> {
  const existing = await ctx.db.query("settings").first();
  if (existing !== null) {
    await ctx.db.patch(existing._id, { featuredEventId: eventId });
    return;
  }
  await ctx.db.insert("settings", { featuredEventId: eventId });
}
