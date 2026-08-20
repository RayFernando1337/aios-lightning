/** Shared between the Convex validation and the form inputs. */

export const DEFAULT_CAPACITY = 8;
export const CAPACITY_MIN = 1;
export const CAPACITY_MAX = 30;

export const FIELD_LIMITS = {
  displayName: 60,
  demoTitle: 90,
  whatYoullShowLive: 500,
  takeaway: 240,
} as const;

export const EVENT_FIELD_LIMITS = {
  name: 80,
  when: 80,
  where: 80,
  room: 80,
  dryRun: 400,
  heroImage: 300,
  slug: 64,
} as const;
