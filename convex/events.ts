import { ConvexError, Infer, v } from "convex/values";
import { MutationCtx, mutation, query } from "./_generated/server";
import { requireHost } from "./lib/auth";
import {
  getEventBySlug,
  getFeaturedEvent,
  getStoredFeaturedEventId,
  requireEvent,
  resolveEvent,
  setFeaturedEvent,
} from "./lib/eventLookup";
import {
  CAPACITY_MAX,
  CAPACITY_MIN,
  DEFAULT_CAPACITY,
  EVENT_FIELD_LIMITS,
} from "./lib/limits";
import { isValidSlug, slugify } from "./lib/slug";
import { requireText } from "./lib/text";
import { phaseValidator, ruleValidator } from "./schema";
import { AIOS_SF_SEED, SITE } from "./seedCopy";

export const publicEventValidator = v.object({
  _id: v.id("events"),
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
});

export type PublicEvent = Infer<typeof publicEventValidator>;

const hostEventValidator = v.object({
  event: publicEventValidator,
  counts: v.object({
    submitted: v.number(),
    shortlisted: v.number(),
    selected: v.number(),
    rejected: v.number(),
  }),
  featured: v.boolean(),
});

function toPublicEvent(event: {
  _id: PublicEvent["_id"];
  name: string;
  slug: string;
  when: string;
  where: string;
  room: string;
  capacity: number;
  dryRun: string;
  heroImage: string;
  phase: PublicEvent["phase"];
  rules: PublicEvent["rules"];
  flow: string[];
}): PublicEvent {
  return {
    _id: event._id,
    name: event.name,
    slug: event.slug,
    when: event.when,
    where: event.where,
    room: event.room,
    capacity: event.capacity,
    dryRun: event.dryRun,
    heroImage: event.heroImage,
    phase: event.phase,
    rules: event.rules,
    flow: event.flow,
  };
}

function requireCapacity(value: number): number {
  if (!Number.isInteger(value) || value < CAPACITY_MIN || value > CAPACITY_MAX) {
    throw new ConvexError(
      `Capacity must be a whole number from ${CAPACITY_MIN} to ${CAPACITY_MAX}.`,
    );
  }
  return value;
}

async function uniqueSlug(ctx: MutationCtx, base: string): Promise<string> {
  if (!isValidSlug(base)) {
    throw new ConvexError(
      "Choose a simpler name. The link can only use letters, numbers, and dashes.",
    );
  }

  const existing = await getEventBySlug(ctx, base);
  if (existing === null) {
    return base;
  }

  for (let suffix = 2; suffix < 50; suffix += 1) {
    const candidate = `${base.slice(0, EVENT_FIELD_LIMITS.slug - 3)}-${suffix}`;
    if (!isValidSlug(candidate)) {
      continue;
    }
    const taken = await getEventBySlug(ctx, candidate);
    if (taken === null) {
      return candidate;
    }
  }

  throw new ConvexError(
    "Could not mint a unique link for that name. Try a different name.",
  );
}

export const featured = query({
  args: {},
  returns: v.union(publicEventValidator, v.null()),
  handler: async (ctx) => {
    const event = await getFeaturedEvent(ctx);
    return event === null ? null : toPublicEvent(event);
  },
});

export const bySlug = query({
  args: { slug: v.optional(v.string()) },
  returns: v.union(publicEventValidator, v.null()),
  handler: async (ctx, args) => {
    const event = await resolveEvent(ctx, args.slug);
    return event === null ? null : toPublicEvent(event);
  },
});

export const listForHost = query({
  args: {},
  returns: v.array(hostEventValidator),
  handler: async (ctx) => {
    await requireHost(ctx);
    const events = await ctx.db.query("events").order("desc").collect();
    const featuredEvent = await getFeaturedEvent(ctx);
    const featuredId = featuredEvent?._id ?? null;

    const rows = [];
    for (const event of events) {
      const submissions = await ctx.db
        .query("submissions")
        .withIndex("by_event_status", (q) => q.eq("eventId", event._id))
        .collect();
      const counts = {
        submitted: 0,
        shortlisted: 0,
        selected: 0,
        rejected: 0,
      };
      for (const submission of submissions) {
        counts[submission.status] += 1;
      }

      rows.push({
        event: toPublicEvent(event),
        counts,
        featured: featuredId === event._id,
      });
    }

    return rows;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    when: v.string(),
    where: v.string(),
    room: v.string(),
    capacity: v.optional(v.number()),
    dryRun: v.optional(v.string()),
  },
  returns: v.object({ eventId: v.id("events"), slug: v.string() }),
  handler: async (ctx, args) => {
    await requireHost(ctx);

    const name = requireText(args.name, "Event name", EVENT_FIELD_LIMITS.name);
    const when = requireText(args.when, "When", EVENT_FIELD_LIMITS.when);
    const where = requireText(args.where, "Where", EVENT_FIELD_LIMITS.where);
    const room = args.room.trim().slice(0, EVENT_FIELD_LIMITS.room);
    const capacity = requireCapacity(args.capacity ?? DEFAULT_CAPACITY);
    const dryRun = requireText(
      args.dryRun ?? SITE.defaultDryRun,
      "Dry run",
      EVENT_FIELD_LIMITS.dryRun,
    );
    const slug = await uniqueSlug(ctx, slugify(name));
    const now = Date.now();

    const eventId = await ctx.db.insert("events", {
      name,
      slug,
      when,
      where,
      room,
      capacity,
      dryRun,
      heroImage: SITE.heroImage,
      phase: "open",
      rules: SITE.defaultRules.map((rule) => ({ ...rule })),
      flow: [...SITE.defaultFlow],
      createdAt: now,
      updatedAt: now,
    });

    const featuredEventId = await getStoredFeaturedEventId(ctx);
    if (featuredEventId === null) {
      await setFeaturedEvent(ctx, eventId);
    }

    return { eventId, slug };
  },
});

export const update = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    when: v.optional(v.string()),
    where: v.optional(v.string()),
    room: v.optional(v.string()),
    capacity: v.optional(v.number()),
    dryRun: v.optional(v.string()),
    phase: v.optional(phaseValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireHost(ctx);
    const event = await requireEvent(ctx, args.eventId);

    const patch: {
      name?: string;
      when?: string;
      where?: string;
      room?: string;
      capacity?: number;
      dryRun?: string;
      phase?: typeof event.phase;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.name !== undefined) {
      patch.name = requireText(args.name, "Event name", EVENT_FIELD_LIMITS.name);
    }
    if (args.when !== undefined) {
      patch.when = requireText(args.when, "When", EVENT_FIELD_LIMITS.when);
    }
    if (args.where !== undefined) {
      patch.where = requireText(args.where, "Where", EVENT_FIELD_LIMITS.where);
    }
    if (args.room !== undefined) {
      patch.room = args.room.trim().slice(0, EVENT_FIELD_LIMITS.room);
    }
    if (args.dryRun !== undefined) {
      patch.dryRun = requireText(args.dryRun, "Dry run", EVENT_FIELD_LIMITS.dryRun);
    }
    if (args.phase !== undefined) {
      patch.phase = args.phase;
    }
    if (args.capacity !== undefined) {
      const capacity = requireCapacity(args.capacity);
      const selected = await ctx.db
        .query("submissions")
        .withIndex("by_event_status", (q) =>
          q.eq("eventId", event._id).eq("status", "selected"),
        )
        .collect();
      if (capacity < selected.length) {
        throw new ConvexError(
          `Capacity cannot drop below the ${selected.length} already selected. Move someone out first.`,
        );
      }
      patch.capacity = capacity;
    }

    await ctx.db.patch(event._id, patch);
    return null;
  },
});

export const setFeatured = mutation({
  args: { eventId: v.id("events") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireHost(ctx);
    await requireEvent(ctx, args.eventId);
    await setFeaturedEvent(ctx, args.eventId);
    return null;
  },
});

export const ensureSeed = mutation({
  args: {},
  returns: v.union(v.id("events"), v.null()),
  handler: async (ctx) => {
    await requireHost(ctx);

    let event = await getEventBySlug(ctx, AIOS_SF_SEED.slug);
    if (event === null) {
      const anyEvent = await ctx.db.query("events").first();
      if (anyEvent === null) {
        const now = Date.now();
        const eventId = await ctx.db.insert("events", {
          ...AIOS_SF_SEED,
          createdAt: now,
          updatedAt: now,
        });
        event = await ctx.db.get(eventId);
      }
    }

    if (event === null) {
      return null;
    }

    const featuredEventId = await getStoredFeaturedEventId(ctx);
    if (featuredEventId === null) {
      await setFeaturedEvent(ctx, event._id);
    }

    const submissions = await ctx.db.query("submissions").collect();
    for (const submission of submissions) {
      if (submission.eventId === undefined) {
        await ctx.db.patch(submission._id, { eventId: event._id });
      }
    }

    return event._id;
  },
});
