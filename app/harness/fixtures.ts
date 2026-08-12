import { Doc, Id } from "@/convex/_generated/dataModel";
import { FIELD_LIMITS } from "@/convex/lib/limits";

/** Grow `seed` with realistic filler until it is exactly `length` characters. */
function toExactly(seed: string, length: number): string {
  const filler =
    " then the same loop again on device with the network switched off";
  let text = seed;
  while (text.length < length) {
    text += filler;
  }
  return text.slice(0, length);
}

function row(
  index: number,
  fields: Omit<
    Doc<"submissions">,
    | "_id"
    | "_creationTime"
    | "userId"
    | "email"
    | "noSlides"
    | "noPitch"
    | "readyIn60s"
    | "createdAt"
    | "updatedAt"
  > & { email?: string },
): Doc<"submissions"> {
  const createdAt = 1_754_900_000_000 + index * 60_000;
  return {
    _id: `fixture_${index}` as Id<"submissions">,
    _creationTime: createdAt,
    userId: `user_${index}`,
    email: fields.email ?? `demo${index}@example.com`,
    displayName: fields.displayName,
    demoTitle: fields.demoTitle,
    whatYoullShowLive: fields.whatYoullShowLive,
    takeaway: fields.takeaway,
    noSlides: true,
    noPitch: true,
    readyIn60s: true,
    status: fields.status,
    createdAt,
    updatedAt: createdAt,
    selectedAt: fields.selectedAt,
  };
}

export const FIXTURES: Doc<"submissions">[] = [
  row(0, {
    displayName: "Ray Fernando",
    demoTitle: "YOLO",
    whatYoullShowLive:
      "Xcode on the projector, one command, and a fresh app on my iPhone 16 in under a minute.",
    takeaway: "You can ship a build to your own phone without a Mac in the room.",
    status: "selected",
    selectedAt: 1_754_900_000_000,
  }),
  row(1, {
    displayName: "Priya Raman",
    demoTitle: "On device Whisper in a Swift app",
    whatYoullShowLive:
      "iPhone 16 mirrored to the projector. A local Whisper model transcribes me live with airplane mode on.\nThen I open Activity Monitor to show it is really running on the phone.",
    takeaway:
      "How to ship a Core ML model without blowing up your app download size.",
    status: "shortlisted",
  }),
  // Worst case for layout: every text field pinned to its hard limit, with the
  // newlines applicants actually type.
  row(2, {
    displayName: toExactly("Alexandra Constantina Papadopoulos", FIELD_LIMITS.displayName),
    demoTitle: toExactly(
      "A local agent that rewrites my terminal history into a runnable script",
      FIELD_LIMITS.demoTitle,
    ),
    whatYoullShowLive: toExactly(
      "Terminal on the big screen. I run a messy twenty command session, then the agent replays it as one clean shell script and executes it against a scratch container.\nNo network, a 7B model on the laptop GPU.\nI break it on purpose halfway through and let it recover,",
      FIELD_LIMITS.whatYoullShowLive,
    ),
    takeaway: toExactly(
      "Your shell history is already a training set for the thing you do twenty times a day, and you can turn it into a script tonight,",
      FIELD_LIMITS.takeaway,
    ),
    status: "submitted",
  }),
  row(3, {
    displayName: "Marcus Webb",
    demoTitle: "Core ML on a Watch, badly",
    whatYoullShowLive:
      "An Apple Watch running a tiny gesture model. I wave at the room and the projector reacts.",
    takeaway: "Watch inference is real, and the battery cost is smaller than you think.",
    status: "submitted",
  }),
  row(4, {
    displayName: "Dana Osei",
    demoTitle: "Replacing my scraper with a screenshot",
    whatYoullShowLive:
      "Two browser windows side by side. The old scraper breaks on a layout change. The vision model does not.",
    takeaway: "Screenshot plus a vision model beats a brittle CSS selector for one off jobs.",
    status: "rejected",
  }),
];
