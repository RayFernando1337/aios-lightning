import { DEFAULT_CAPACITY } from "./lib/limits";

export const AIOS_SF_SEED = {
  name: "AiOS SF · Lightning",
  slug: "aios-sf-lightning",
  when: "Tonight, Tue Aug 11",
  where: "Convex HQ, San Francisco",
  room: "",
  capacity: DEFAULT_CAPACITY,
  dryRun:
    "Dry run with Ray 20 to 30 minutes before lightning starts. Cables, audio, and your first 10 seconds. If it does not run at the dry run, it does not go on stage.",
  heroImage:
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80",
  phase: "open" as const,
  rules: [
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
      title: `Max ${DEFAULT_CAPACITY} slots, about 2 to 3 minutes each`,
      body: "Short, sharp, and on time.",
    },
  ],
  flow: [
    "Apply below. It takes about a minute.",
    `Hosts pick up to ${DEFAULT_CAPACITY} demos tonight.`,
    "Dry run with Ray before we start.",
    "Plug in, show it running, sit down.",
  ],
};

export const SITE = {
  brand: "AiOS SF · Lightning",
  heroImage: AIOS_SF_SEED.heroImage,
  repoUrl: "https://github.com/RayFernando1337/aios-lightning",
  defaultDryRun: AIOS_SF_SEED.dryRun,
  defaultRules: AIOS_SF_SEED.rules,
  defaultFlow: AIOS_SF_SEED.flow,
} as const;
