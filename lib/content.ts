import { MAX_SELECTED } from "@/convex/lib/limits";

export const EVENT = {
  brand: "AiOS SF · Lightning",
  when: "Tonight, Tue Aug 11",
  where: "Convex HQ, San Francisco",
  dryRun:
    "Dry run with Ray 20 to 30 minutes before lightning starts. Cables, audio, and your first 10 seconds. If it does not run at the dry run, it does not go on stage.",
} as const;

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
