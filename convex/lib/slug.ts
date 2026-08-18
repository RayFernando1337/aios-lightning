import { EVENT_FIELD_LIMITS } from "./limits";

const RESERVED = new Set([
  "apply",
  "board",
  "host",
  "harness",
  "e",
  "api",
  "admin",
  "events",
  "n",
]);

export function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, EVENT_FIELD_LIMITS.slug)
    .replace(/-+$/, "");

  return slug.length > 0 ? slug : "event";
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug);
}

export function hasSlugShape(slug: string): boolean {
  return (
    slug.length > 0 &&
    slug.length <= EVENT_FIELD_LIMITS.slug &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  );
}

export function isValidSlug(slug: string): boolean {
  return hasSlugShape(slug) && !isReservedSlug(slug);
}
