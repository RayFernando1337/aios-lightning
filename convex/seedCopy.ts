import { GuestCopy } from "./lib/guestCopy";
import { DEFAULT_CAPACITY } from "./lib/limits";

const STATIC_RULES = [
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
] as const;

export function copyForCapacity(capacity: number): {
  rules: Array<{ title: string; body: string }>;
  flow: string[];
} {
  return {
    rules: [
      ...STATIC_RULES.map((rule) => ({ ...rule })),
      {
        title: `Max ${capacity} slots, about 2 to 3 minutes each`,
        body: "Short, sharp, and on time.",
      },
    ],
    flow: [
      "Apply below. It takes about a minute.",
      `Hosts pick up to ${capacity} demos tonight.`,
      "Dry run with Ray before we start.",
      "Plug in, show it running, sit down.",
    ],
  };
}

export const LIGHTNING_GUEST_COPY: GuestCopy = {
  brand: "AiOS SF Lightning",
  boardHeading: "TONIGHT'S BOARD",
  heroLead: "demos. Two to three minutes each. Working software only.",
  applyTitle: "APPLY TO DEMO",
  applyLead:
    "Tell us what will be running on screen and what the room learns from it.",
  applyCta: "Apply for a slot",
  applyCtaSignedOut: "Sign in and apply",
  showTakeawayOnBoard: true,
  liveReviewLabel: "Showing live",
  takeawayReviewLabel: "Takeaway",
  displayName: {
    label: "Your name",
    hint: "How the host should read it out.",
    placeholder: "Ray Fernando",
  },
  demoTitle: {
    label: "Demo title",
    hint: "Six words or fewer lands best.",
    placeholder: "On device Whisper in a Swift app",
  },
  whatYoullShowLive: {
    label: "What you will show live",
    hint: "What is on screen, what is running, and on what device. Open with it. Hosts pick from the first couple of lines.",
    placeholder:
      "iPhone 16 on stage mirror, local model transcribing me in real time, no network.",
  },
  takeaway: {
    label: "One takeaway for the room",
    hint: "What can someone go try tomorrow because they watched you?",
    placeholder: "How to ship a Core ML model without blowing up app size.",
  },
  noSlides: "No slides. Laptop or phone demo only.",
  noPitch: "No pitch. No downloads, no waitlists, no pricing.",
  readyIn60s: "I can be plugged in and running in 60 seconds.",
};

export const HTW_GUEST_COPY: GuestCopy = {
  brand: "Grok Bot HTW",
  boardHeading: "THIS MORNING'S BOTS",
  heroLead:
    "bots. 2 to 3 minutes each. Something running, built today. No slides.",
  applyTitle: "APPLY WITH A BOT",
  applyLead:
    "Name the bot. Say what it does on screen this morning. One line on what it did, not a pitch.",
  applyCta: "Apply with a bot",
  applyCtaSignedOut: "Sign in and apply",
  showTakeawayOnBoard: false,
  liveReviewLabel: "What it does",
  takeawayReviewLabel: "Takeaway",
  displayName: {
    label: "Name",
    hint: "How the host should read it out.",
    placeholder: "Ray Fernando",
  },
  demoTitle: {
    label: "Bot name",
    hint: "What the bot is called.",
    placeholder: "Harbor Scout",
  },
  whatYoullShowLive: {
    label: "What you will run live",
    hint: "The thing it does, this morning, on screen.",
    placeholder:
      "Laptop on the projector. I ask the bot to book a table and it talks to the restaurant site live.",
  },
  takeaway: {
    label: "One-line takeaway",
    hint: "What it did, not a pitch.",
    placeholder: "It booked the table from a messy open tab.",
  },
  noSlides: "No slides. The bot has to run.",
  noPitch: "No pitch. This is not a product track.",
  readyIn60s: "I can be plugged in and running in 60 seconds.",
};

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
  phase: "archived" as const,
  guestCopy: LIGHTNING_GUEST_COPY,
  ...copyForCapacity(DEFAULT_CAPACITY),
};

export const HTW_SEED = {
  name: "Build with Grok Bot @ Hawaii Tech Week",
  slug: "htw-grok-bot",
  when: "Sat Sep 5, 2026, 9:00 AM to 12:30 PM HST",
  where: "643 Ilalo St, Honolulu, HI 96813",
  room: "Entrepreneurs Sandbox",
  capacity: DEFAULT_CAPACITY,
  dryRun:
    "Be ready to plug in and run the bot. If it does not run, it does not go on.",
  heroImage:
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80",
  phase: "open" as const,
  guestCopy: HTW_GUEST_COPY,
  hostNote:
    "Draft agenda, not on Luma yet. Door check-in is Luma. https://luma.com/hawaii-z15e. Luma cap 100. Lightning cap 8.",
  rules: [
    {
      title: "Running software only",
      body: "No slides, no pitches. The bot has to run.",
    },
    {
      title: "Built this morning",
      body: "Show what you got working this morning. Grok Bot, live and raw.",
    },
    {
      title: `Max ${DEFAULT_CAPACITY} slots, about 2 to 3 minutes each`,
      body: "2-3 min, something running, built today. No slides.",
    },
  ],
  flow: [
    "Apply below. It takes about a minute.",
    `Hosts pick up to ${DEFAULT_CAPACITY} bots.`,
    "Plug in, show it running, sit down.",
  ],
};

export const SITE = {
  brand: "AiOS SF · Lightning",
  heroImage: AIOS_SF_SEED.heroImage,
  repoUrl: "https://github.com/RayFernando1337/aios-lightning",
  defaultDryRun: AIOS_SF_SEED.dryRun,
} as const;
