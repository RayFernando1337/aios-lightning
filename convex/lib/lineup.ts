import { ConvexError, Infer, v } from "convex/values";
import { EVENT_FIELD_LIMITS, TALK_FIELD_LIMITS } from "./limits";
import { optionalHttpsUrl, optionalText, requireText } from "./text";

export const talkValidator = v.object({
  title: v.string(),
  speakerName: v.string(),
  affiliation: v.optional(v.string()),
  blurb: v.optional(v.string()),
  url: v.optional(v.string()),
});

export type Talk = Infer<typeof talkValidator>;

const CLOCK_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Trims every field. An empty list clears the lineup (returns undefined). */
export function normalizeTalks(talks: Talk[]): Talk[] | undefined {
  if (talks.length > TALK_FIELD_LIMITS.count) {
    throw new ConvexError(
      `A lineup holds at most ${TALK_FIELD_LIMITS.count} talks.`,
    );
  }
  if (talks.length === 0) {
    return undefined;
  }
  return talks.map((talk, index) => {
    const label = `Talk ${index + 1}`;
    const affiliation = optionalText(
      talk.affiliation ?? "",
      `${label} affiliation`,
      TALK_FIELD_LIMITS.affiliation,
    );
    const blurb = optionalText(
      talk.blurb ?? "",
      `${label} blurb`,
      TALK_FIELD_LIMITS.blurb,
    );
    const url = optionalHttpsUrl(
      talk.url ?? "",
      `${label} link`,
      TALK_FIELD_LIMITS.url,
    );
    return {
      title: requireText(talk.title, `${label} title`, TALK_FIELD_LIMITS.title),
      speakerName: requireText(
        talk.speakerName,
        `${label} speaker`,
        TALK_FIELD_LIMITS.speakerName,
      ),
      ...(affiliation !== undefined && { affiliation }),
      ...(blurb !== undefined && { blurb }),
      ...(url !== undefined && { url }),
    };
  });
}

/** Trims names and drops blanks. An empty list clears the field. */
export function normalizeHostNames(names: string[]): string[] | undefined {
  const trimmed = names.map((name) => name.trim()).filter((name) => name.length > 0);
  if (trimmed.length > EVENT_FIELD_LIMITS.hostNames) {
    throw new ConvexError(
      `List at most ${EVENT_FIELD_LIMITS.hostNames} hosts.`,
    );
  }
  for (const name of trimmed) {
    if (name.length > EVENT_FIELD_LIMITS.hostName) {
      throw new ConvexError(
        `Host names must be ${EVENT_FIELD_LIMITS.hostName} characters or fewer.`,
      );
    }
  }
  return trimmed.length === 0 ? undefined : trimmed;
}

/** 24h HH:MM, same shape as the doors time. Empty clears it. */
export function optionalClockTime(value: string, label: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (!CLOCK_RE.test(trimmed)) {
    throw new ConvexError(`${label} must be a time like 20:30.`);
  }
  return trimmed;
}
