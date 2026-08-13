import { MAX_SELECTED } from "@/convex/lib/limits";

/**
 * The edit-me file for running your own event. Name the night, the venue, the
 * dry-run rule, the house rules, and the hero still here. The landing page, apply flow, and
 * board pick them up. The shipped values are the AiOS SF lightning night at
 * Convex HQ, left in as a worked example.
 *
 * Two knobs live elsewhere: capacity is `MAX_SELECTED` in
 * `convex/lib/limits.ts`, and the brand name also appears in `app/layout.tsx`
 * metadata, `SiteHeader`, and the page titles (search for "AiOS SF" when
 * rebranding).
 */

export const EVENT = {
  brand: "AiOS SF · Lightning",
  when: "Tonight, Tue Aug 11",
  where: "Convex HQ, San Francisco",
  dryRun:
    "Dry run with Ray 20 to 30 minutes before lightning starts. Cables, audio, and your first 10 seconds. If it does not run at the dry run, it does not go on stage.",
  heroImage:
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80",
  // The template this event runs on. Point it at your fork if you want the
  // footer credit to link somewhere else, or drop it from the footer entirely.
  repoUrl: "https://github.com/RayFernando1337/aios-lightning",
} as const;

export const FLOW = [
  "Apply below. It takes about a minute.",
  `Hosts pick up to ${MAX_SELECTED} demos tonight.`,
  "Dry run with Ray before we start.",
  "Plug in, show it running, sit down.",
] as const;

export const RULES = [
  {
    title: "No slides",
    body: "Laptop or phone demo only. Terminal counts.",
  },
  {
    title: "No product pitches",
    body: "No download my app, no waitlists, no pricing.",
  },
  {
    title: "Show something running",
    body: "Live beats recorded. Recorded beats talking about it.",
  },
  {
    title: "One takeaway the room can learn",
    body: "iOS, on device, Swift, and local AI go to the front of the line.",
  },
  {
    title: `Max ${MAX_SELECTED} slots, about 2 to 3 minutes each`,
    body: "Short, sharp, and on time.",
  },
] as const;
