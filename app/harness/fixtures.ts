import { Doc, Id } from "@/convex/_generated/dataModel";
import { FIELD_LIMITS } from "@/convex/lib/limits";

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
    | "eventId"
    | "userId"
    | "email"
    | "noSlides"
    | "noPitch"
    | "readyIn60s"
    | "createdAt"
    | "updatedAt"
  >,
): Doc<"submissions"> {
  const createdAt = 1_754_900_000_000 + index * 60_000;
  return {
    _id: `fixture_${index}` as Id<"submissions">,
    _creationTime: createdAt,
    eventId: "fixture_event" as Id<"events">,
    userId: `user_${index}`,
    email: `demo${index}@example.com`,
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
  // The case the clamp handles worst: the demo is real but buried under a
  // paragraph of preamble, so the visible lines say nothing about it.
  row(4, {
    displayName: "Tomas Lindqvist",
    demoTitle: "Gesture control for a projector",
    whatYoullShowLive:
      "I have been building this on and off since last spring, mostly on weekends, and my background is embedded rather than the usual web stack, so bear with me on the tooling choices because they are not what this crowd would pick. Anyway, the actual demo: I put an ESP32 on the projector and drive the slides by waving at it, with the model running on the chip.",
    takeaway: "A gesture model fits on a two dollar microcontroller.",
    status: "submitted",
  }),
  row(5, {
    displayName: "Dana Osei",
    demoTitle: "Replacing my scraper with a screenshot",
    whatYoullShowLive:
      "Two browser windows side by side. The old scraper breaks on a layout change. The vision model does not.",
    takeaway: "Screenshot plus a vision model beats a brittle CSS selector for one off jobs.",
    status: "rejected",
  }),
];
